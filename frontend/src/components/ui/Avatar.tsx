import { clsx } from 'clsx';

export function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ name, color = '#4f46e5', size = 'md' }: { name: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white',
        size === 'sm' && 'h-7 w-7 text-[10px]',
        size === 'md' && 'h-9 w-9 text-xs',
        size === 'lg' && 'h-11 w-11 text-sm',
      )}
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </span>
  );
}
