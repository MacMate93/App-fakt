import type { ButtonHTMLAttributes } from 'react';
import styles from './ui.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'default' | 'small';
}

const variants: Record<Variant, string> = {
  primary: '',
  secondary: styles.secondary,
  ghost: styles.ghost,
};

export function Button({ variant = 'primary', size = 'default', className, ...rest }: ButtonProps) {
  const classes = [styles.button, variants[variant], size === 'small' ? styles.small : '', className]
    .filter(Boolean)
    .join(' ');
  return <button type="button" className={classes} {...rest} />;
}
