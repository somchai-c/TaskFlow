import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Commencing database seeding process...');

  // 1. Clean existing records (cascade deletions will handle relations)
  await prisma.projectMember.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.taskTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned old records successfully.');

  // 2. Hash standard test password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Users
  const u1 = await prisma.user.create({
    data: {
      id: 'u1',
      name: 'Sarah Johnson',
      email: 'sarah@taskflow.com',
      passwordHash,
      avatarColor: 'bg-emerald-600',
      initials: 'SJ',
      role: 'Project Manager'
    }
  });

  const u2 = await prisma.user.create({
    data: {
      id: 'u2',
      name: 'Michael Chen',
      email: 'michael@taskflow.com',
      passwordHash,
      avatarColor: 'bg-blue-600',
      initials: 'MC',
      role: 'Lead Developer'
    }
  });

  const u3 = await prisma.user.create({
    data: {
      id: 'u3',
      name: 'Emma Davis',
      email: 'emma@taskflow.com',
      passwordHash,
      avatarColor: 'bg-fuchsia-600',
      initials: 'ED',
      role: 'UI/UX Designer'
    }
  });

  const u4 = await prisma.user.create({
    data: {
      id: 'u4',
      name: 'Alex Rivera',
      email: 'alex@taskflow.com',
      passwordHash,
      avatarColor: 'bg-rose-600',
      initials: 'AR',
      role: 'QA Engineer'
    }
  });

  const u5 = await prisma.user.create({
    data: {
      id: 'u5',
      name: 'Sophia Martinez',
      email: 'sophia@taskflow.com',
      passwordHash,
      avatarColor: 'bg-amber-600',
      initials: 'SM',
      role: 'Product Owner'
    }
  });

  console.log('Seeded 5 team users.');

  // 4. Create Projects
  const p1 = await prisma.project.create({
    data: {
      id: 'p1',
      name: 'Website Redesign',
      description: 'Fresh and modern company website overhaul to improve lead conversion and landing page speeds.'
    }
  });

  const p2 = await prisma.project.create({
    data: {
      id: 'p2',
      name: 'Mobile App Launch',
      description: 'Development and launch of our iOS & Android mobile companion applications.'
    }
  });

  const p3 = await prisma.project.create({
    data: {
      id: 'p3',
      name: 'Cloud Infrastructure Upgrade',
      description: 'Transitioning legacy hosting environments to high-availability Google Cloud services.'
    }
  });

  console.log('Seeded 3 project boards.');

  // 5. Add Project Memberships
  // Project 1: Sarah, Michael, Emma, Sophia
  await prisma.projectMember.createMany({
    data: [
      { projectId: 'p1', userId: 'u1' },
      { projectId: 'p1', userId: 'u2' },
      { projectId: 'p1', userId: 'u3' },
      { projectId: 'p1', userId: 'u5' }
    ]
  });

  // Project 2: Sarah, Michael, Alex
  await prisma.projectMember.createMany({
    data: [
      { projectId: 'p2', userId: 'u1' },
      { projectId: 'p2', userId: 'u2' },
      { projectId: 'p2', userId: 'u4' }
    ]
  });

  // Project 3: Sarah, Michael, Alex
  await prisma.projectMember.createMany({
    data: [
      { projectId: 'p3', userId: 'u1' },
      { projectId: 'p3', userId: 'u2' },
      { projectId: 'p3', userId: 'u4' }
    ]
  });

  console.log('Created project members associations.');

  // 6. Create Base Tags
  const tagNames = ['design', 'UX', 'frontend', 'auth', 'branding', 'marketing', 'telemetry', 'analytics', 'copywriting', 'database', 'infra', 'stg'];
  const tagMap: Record<string, string> = {};

  for (const name of tagNames) {
    const createdTag = await prisma.tag.create({
      data: { name }
    });
    tagMap[name] = createdTag.id;
  }

  // 7. Seed Tasks
  const t1 = await prisma.task.create({
    data: {
      id: 't1',
      title: 'Create homepage wireframes',
      description: 'Design key homepage concepts focusing on intuitive user navigation and speedier copy sections. Include layout wireframes and user interaction routes.',
      projectId: 'p1',
      assigneeId: 'u3',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2026-06-15'
    }
  });

  const t2 = await prisma.task.create({
    data: {
      id: 't2',
      title: 'Implement login page UI',
      description: 'Build complete responsive front-end and error message workflows using global layout standards.',
      projectId: 'p2',
      assigneeId: 'u2',
      priority: 'Medium',
      status: 'To Do',
      dueDate: '2026-06-18'
    }
  });

  const t3 = await prisma.task.create({
    data: {
      id: 't3',
      title: 'Review branding assets & logo',
      description: 'Validate final typography, brand rules, colors, and layout ratios with the branding director.',
      projectId: 'p1',
      assigneeId: 'u1',
      priority: 'Low',
      status: 'Review',
      dueDate: '2026-06-12'
    }
  });

  const t4 = await prisma.task.create({
    data: {
      id: 't4',
      title: 'Configure telemetry reporting',
      description: 'Install simple telemetry libraries and hook up user interaction clicks safely without bloating assets.',
      projectId: 'p2',
      assigneeId: 'u2',
      priority: 'High',
      status: 'Backlog',
      dueDate: '2026-06-25'
    }
  });

  const t5 = await prisma.task.create({
    data: {
      id: 't5',
      title: 'Draft mobile launch newsletter copy',
      description: 'Publish complete content layout emphasizing benefits, pricing structure, and user referral links.',
      projectId: 'p2',
      assigneeId: 'u5',
      priority: 'Low',
      status: 'Done',
      dueDate: '2026-06-01'
    }
  });

  const t6 = await prisma.task.create({
    data: {
      id: 't6',
      title: 'Migrate staging databases',
      description: 'Convert schema entries, execute clean index creations, and verify high availability replicas of product inventories.',
      projectId: 'p3',
      assigneeId: 'u2',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2026-06-10'
    }
  });

  const t7 = await prisma.task.create({
    data: {
      id: 't7',
      title: 'Create test automation suites',
      description: 'Write critical user flow browser automated tests validating logins, item carts, and payment checkouts.',
      projectId: 'p3',
      assigneeId: 'u4',
      priority: 'Medium',
      status: 'To Do',
      dueDate: '2026-06-20'
    }
  });

  console.log('Seeded 7 baseline tasks.');

  // 8. Associate tags to tasks via TaskTag
  const taskTagsRelations = [
    { taskId: 't1', tag: 'design' },
    { taskId: 't1', tag: 'UX' },
    { taskId: 't1', tag: 'frontend' },
    { taskId: 't2', tag: 'frontend' },
    { taskId: 't2', tag: 'auth' },
    { taskId: 't3', tag: 'branding' },
    { taskId: 't3', tag: 'marketing' },
    { taskId: 't4', tag: 'telemetry' },
    { taskId: 't4', tag: 'analytics' },
    { taskId: 't5', tag: 'marketing' },
    { taskId: 't5', tag: 'copywriting' },
    { taskId: 't6', tag: 'database' },
    { taskId: 't6', tag: 'infra' },
    { taskId: 't6', tag: 'stg' }
  ];

  await prisma.taskTag.createMany({
    data: taskTagsRelations.map(tr => ({
      taskId: tr.taskId,
      tagId: tagMap[tr.tag]
    }))
  });

  console.log('Created tag associations.');

  // 9. Seed Comments
  await prisma.comment.createMany({
    data: [
      {
        id: 'c1',
        taskId: 't1',
        userId: 'u1',
        message: 'Please update the main navigation section. It needs to clearly display high-margin services higher up.',
        createdAt: new Date('2026-06-01T10:30:00Z')
      },
      {
        id: 'c2',
        taskId: 't1',
        userId: 'u3',
        message: 'Updated the wireframes with a sticky navigation bar! Added responsive prototypes for tablet and phone dimensions too.',
        createdAt: new Date('2026-06-01T14:15:00Z')
      },
      {
        id: 'c3',
        taskId: 't4',
        userId: 'u2',
        message: 'Reviewing database connections. Will create indexes to handle high read loads.',
        createdAt: new Date('2026-06-01T18:05:00Z')
      }
    ]
  });

  console.log('Seeded discussion timeline comments.');
  console.log('Database seeding successfully accomplished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
