/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../types';

interface AvatarProps {
  user?: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '', 
  showTooltip = true 
}) => {
  if (!user) {
    return (
      <div 
        className={`rounded-full bg-slate-200 text-slate-500 font-medium flex items-center justify-center border-2 border-white select-none
          ${size === 'xs' ? 'w-5 h-5 text-[8px]' : ''}
          ${size === 'sm' ? 'w-7 h-7 text-[10px]' : ''}
          ${size === 'md' ? 'w-9 h-9 text-xs' : ''}
          ${size === 'lg' ? 'w-11 h-11 text-sm' : ''}
          ${size === 'xl' ? 'w-16 h-16 text-xl' : ''}
          ${className}`}
      >
        --
      </div>
    );
  }

  return (
    <div 
      className={`rounded-full font-semibold flex items-center justify-center text-white border-2 border-white select-none shadow-sm transition-transform hover:scale-105 duration-200 cursor-default ${user.avatarColor}
        ${size === 'xs' ? 'w-5 h-5 text-[8px]' : ''}
        ${size === 'sm' ? 'w-7 h-7 text-[10px]' : ''}
        ${size === 'md' ? 'w-9 h-9 text-xs' : ''}
        ${size === 'lg' ? 'w-11 h-11 text-sm' : ''}
        ${size === 'xl' ? 'w-16 h-16 text-xl' : ''}
        ${className}`}
      title={showTooltip ? `${user.name} \n(${user.role})` : undefined}
    >
      {user.initials}
    </div>
  );
};
