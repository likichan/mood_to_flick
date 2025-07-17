import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

export default function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  const base =
    'px-6 py-2 rounded font-bold transition cursor-pointer focus:outline-none';
  const color =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50';
  return (
    <button className={`${base} ${color}`} {...props}>
      {children}
    </button>
  );
}
