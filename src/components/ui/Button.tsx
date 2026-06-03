import React from 'react';

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'dashed';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  v?: BtnVariant;
  full?: boolean;
}

export function Btn({ children, v = 'primary', full, className = '', ...props }: BtnProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-1.5 border-none rounded-[10px] py-2.5 px-4 font-semibold text-sm cursor-pointer transition-opacity disabled:opacity-45';

  const variantStyles: Record<BtnVariant, string> = {
    primary: 'bg-[var(--teal)] text-white',
    ghost: 'bg-[var(--card-border)] text-[var(--text)]',
    danger: 'bg-red-500/10 text-red-500',
    dashed: 'bg-transparent text-[var(--teal)] border-[1.5px] border-dashed border-[var(--teal)]',
  };

  const widthStyle = full ? 'w-full' : '';

  return (
    <button
      type={props.type || 'button'}
      className={`${baseStyles} ${variantStyles[v]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
