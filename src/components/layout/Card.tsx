import type { ReactNode } from 'react';
import styles from './layout.module.css';

interface CardProps {
  children: ReactNode;
  padded?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function Card({ children, padded = true, className, as: Tag = 'section' }: CardProps) {
  return (
    <Tag className={[styles.card, padded ? styles.cardPadded : '', className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, hint }: { title: ReactNode; hint?: ReactNode }) {
  return (
    <header className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {hint ? <span className={styles.cardHint}>{hint}</span> : null}
    </header>
  );
}
