import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hoverable = true,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "card p-6",
        hoverable && "card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
