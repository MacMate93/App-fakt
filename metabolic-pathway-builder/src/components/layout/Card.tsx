import { forwardRef, type HTMLAttributes } from 'react';
import styles from './ui.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padded = true, className, ...rest },
  ref,
) {
  const classes = [styles.card, padded ? styles.cardPad : '', className].filter(Boolean).join(' ');
  return <div ref={ref} className={classes} {...rest} />;
});
