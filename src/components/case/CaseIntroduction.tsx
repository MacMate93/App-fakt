import type { Case } from '../../types/content';
import { useLocale } from '../../state/LocaleProvider';
import { Badge } from '../layout/Badge';
import { Button } from '../layout/Button';
import { Card } from '../layout/Card';
import { FindingsTable } from './FindingsTable';
import styles from './case.module.css';

const CONTEXT_LABEL = {
  human: 'Human',
  veterinary: 'Veterinary',
  comparative: 'Comparative',
};

/** The case brief: only the information needed to start reasoning. */
export function CaseIntroduction({ case: kase, onStart }: { case: Case; onStart: () => void }) {
  const { text, ui } = useLocale();

  return (
    <Card>
      <div className={styles.caseHeader}>
        <Badge tone="accent">{CONTEXT_LABEL[kase.context]}</Badge>
        {kase.species ? <Badge>{kase.species}</Badge> : null}
      </div>
      <h1 className={styles.caseTitle}>{text(kase.title)}</h1>
      <p className={styles.intro}>{text(kase.introduction)}</p>
      <FindingsTable findings={kase.findings} title={ui.player.observed} />
      <div className={styles.actions}>
        <Button onClick={onStart}>{ui.player.beginCase}</Button>
      </div>
    </Card>
  );
}
