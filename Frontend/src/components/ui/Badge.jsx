import React from 'react';

export const Badge = ({
  status,
  children,
  className = '',
}) => {
  const label = children || status;

  const styles = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Revoked: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Expired: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const defaultStyle = styles[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${defaultStyle} ${className}`}
    >
      <span className="mr-1 w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
};
