import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LOCALES, LOCALE_LABELS } from '../../types/i18n';
import { useLocale } from '../../state/LocaleProvider';
import styles from './layout.module.css';

/** Persistent frame: brand, language switch and the page container. */
export function AppShell({ children, meta }: { children: ReactNode; meta?: ReactNode }) {
  const { locale, setLocale, ui } = useLocale();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandTitle}>{ui.app.title}</span>
            <span className={styles.brandSubtitle}>{ui.app.tagline}</span>
          </Link>
          <div className={styles.headerSpacer} />
          {meta ? <span className={styles.headerMeta}>{meta}</span> : null}
          <div className={styles.localeSwitch} role="group" aria-label={ui.common.language}>
            {LOCALES.map((option) => (
              <button
                key={option}
                type="button"
                className={styles.localeOption}
                aria-pressed={locale === option}
                onClick={() => setLocale(option)}
              >
                {option.toUpperCase()}
                <span className="visually-hidden"> {LOCALE_LABELS[option]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
