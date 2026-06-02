import { Response } from 'express';
import { prisma } from '../prismaClient';
import { AuthRequest } from '../middleware/authMiddleware';

// Get progress helper function (matches frontend context dynamic calculation)
const calculateProjectProgress = async (projectId: string): Promise<number> => {
  const totalTasks = await prisma.task.count({
    where: { projectId }
  });
  if (totalTasks === 0) return 0;

  const doneTasks = await prisma.task.count({
    where: { projectId, status: 'Done' }
  });

  return Math.round((doneTasks / totalTasks) * 100);
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    // Query projects the user is a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      include: {
        project: {
          include: {
            members: true
          }
        }
      }
    });

    const projectsList = await Promise.all(memberships.map(async (m) => {
      const proj = m.project;
      const progress = await calculateProjectProgress(proj.id);
      return {
        id: proj.id,
        name: proj.name,
        description: proj.description || '',
        progress,
        members: proj.members.map(member => member.userId)
      };
    }));

    res.status(200).json(projectsList);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true
          }
        },
        tasks: {
          include: {
            tags: {
              include: {
                tag: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      res.status(404).json({ error: 'Project board not found.' });
      return;
    }

    const progress = await calculateProjectProgress(project.id);

    // Format tags inside task responses nicely for frontend consumption
    const formattedTasks = project.tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      projectId: t.projectId,
      assigneeId: t.assigneeId || '',
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      tags: t.tags.map(tt => tt.tag.name)
    }));

    res.status(200).json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description || '',
        progress,
        members: project.members.map(m => m.userId)
      },
      tasks: formattedTasks,
      membersDetails: project.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarColor: m.user.avatarColor,
        initials: m.user.initials,
        role: m.user.role
      }))
    });
  } catch (error) {
    console.error('Fetch project detail error:', error);
    res.status(500).json({ error: 'Failed to fetch project details.' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { name, description, members } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Project name is required.' });
      return;
    }

    // Default to putting the creator in the project if no members provided
    const targetMembers: string[] = Array.isArray(members) && members.length > 0
      ? members
      : [req.user.id];

    // Transactionally create project and assign members
    const newProject = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : ''
        }
      });

      // Map memberships
      const membershipData = targetMembers.map(userId => ({
        projectId: proj.id,
        userId
      }));

      await tx.projectMember.createMany({
        data: membershipData
      });

      return proj;
    });

    const progress = await calculateProjectProgress(newProject.id);

    res.status(201).json({
      id: newProject.id,
      name: newProject.name,
      description: newProject.description || '',
      progress,
      members: targetMembers
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to launch project board.' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Project name is required.' });
      return;
    }

    const updatedProj = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description ? description.trim() : ''
        }
      });

      if (Array.isArray(members)) {
        // Clear old members
        await tx.projectMember.deleteMany({
          where: { projectId: id }
        });

        // Insert new members
        const membershipData = members.map(userId => ({
          projectId: id,
          userId
        }));
        await tx.projectMember.createMany({
          data: membershipData
        });
      }

      return proj;
    });

    const progress = await calculateProjectProgress(updatedProj.id);
    const finalMembers = await prisma.projectMember.findMany({
      where: { projectId: id }
    });

    res.status(200).json({
      id: updatedProj.id,
      name: updatedProj.name,
      description: updatedProj.description || '',
      progress,
      members: finalMembers.map(m => m.userId)
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project board.' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prisma Cascade deletion will handle task tags, tasks, comments, and members.
    await prisma.project.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Project successfully deleted.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project board.' });
  }
};
