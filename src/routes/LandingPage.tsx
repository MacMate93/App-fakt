import { Fragment, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLocale } from '../state/LocaleProvider';
import { useProgress } from '../state/ProgressProvider';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/layout/Button';
import { Card, CardHeader } from '../components/layout/Card';
import styles from './routes.module.css';

/** Entry point: the reasoning chain the course trains, and a local identifier. */
export function LandingPage() {
  const { ui } = useLocale();
  const { ready, progress, signIn } = useProgress();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  if (ready && progress) return <Navigate to="/dashboard" replace />;

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    signIn(trimmed);
    navigate('/dashboard');
  };

  return (
    <AppShell>
      <div className={styles.landing}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>{ui.app.title}</h1>
          <p className={styles.heroSubtitle}>{ui.app.subtitle}</p>
          <p className={styles.heroTagline}>{ui.app.tagline}</p>
          <p className={styles.heroIntro}>{ui.landing.intro}</p>

          <div className={styles.chainTitle}>{ui.landing.chainTitle}</div>
          <div className={styles.chain}>
            {ui.landing.chain.map((step, index) => (
              <Fragment key={step}>
                {index > 0 ? (
                  <span className={styles.chainArrow} aria-hidden="true">
                    →
                  </span>
                ) : null}
                <span className={styles.chainStep}>{step}</span>
              </Fragment>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader title={ui.landing.startButton} />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div className={styles.field}>
              <label className={styles.label} htmlFor="student-id">
                {ui.landing.nameLabel}
              </label>
              <input
                id="student-id"
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={ui.landing.namePlaceholder}
                autoComplete="off"
                maxLength={60}
              />
              <span className={styles.help}>{ui.landing.nameHint}</span>
            </div>
            <Button type="submit" disabled={!name.trim()}>
              {ui.landing.startButton}
            </Button>
          </form>
          <p className={styles.privacy}>{ui.landing.privacy}</p>
        </Card>
      </div>
    </AppShell>
  );
}
