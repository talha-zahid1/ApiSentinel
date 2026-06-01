import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  className = '',
  type = 'text',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-zinc-400 select-none uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        className={`w-full rounded-lg bg-zinc-900 border ${
          error ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
        } px-3.5 py-2 text-sm text-foreground placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-destructive font-medium animate-slide-in">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
