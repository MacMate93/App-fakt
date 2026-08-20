import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useProgress } from '@/state/ProgressProvider';
import styles from './shell.module.css';

export function AppShell({ children }: { children: ReactNode }) {
  const { progress } = useProgress();
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.mark} aria-hidden="true" />
            <span>
              <span className={styles.brandName}>Metabolic Pathway Builder</span>
              <span className={styles.brandTag}>Build it. Understand it. Master metabolism.</span>
            </span>
          </Link>
          <nav className={styles.nav}>
            <NavLink
              to="/"
              className={({ isActive }) => [styles.navLink, isActive ? styles.navActive : ''].join(' ')}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/explore/glycolysis"
              className={({ isActive }) => [styles.navLink, isActive ? styles.navActive : ''].join(' ')}
            >
              Explore
            </NavLink>
            <span className={styles.xp}>{progress.totalXp.toLocaleString('en-US')} XP</span>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
