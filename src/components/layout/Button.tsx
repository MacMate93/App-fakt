import type { ButtonHTMLAttributes } from 'react';
import styles from './layout.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: '',
  secondary: styles.buttonSecondary,
  ghost: styles.buttonGhost,
  danger: styles.buttonDanger,
};

export function Button({ variant = 'primary', small, className, ...rest }: ButtonProps) {
  const classes = [styles.button, VARIANT_CLASS[variant], small ? styles.buttonSmall : '', className]
    .filter(Boolean)
    .join(' ');
  return <button type="button" className={classes} {...rest} />;
}
