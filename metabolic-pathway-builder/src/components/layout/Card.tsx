import type { HTMLAttributes } from 'react';
import styles from './ui.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded = true, className, ...rest }: CardProps) {
  const classes = [styles.card, padded ? styles.cardPad : '', className].filter(Boolean).join(' ');
  return <div className={classes} {...rest} />;
}
