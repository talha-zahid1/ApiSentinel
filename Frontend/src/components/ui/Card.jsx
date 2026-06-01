import React from 'react';

export const Card = ({
  title,
  description,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-panel glow-box rounded-xl p-6 flex flex-col gap-4 overflow-hidden ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && (
            <h3 className="text-lg font-semibold text-zinc-100 tracking-tight leading-none">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-zinc-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
