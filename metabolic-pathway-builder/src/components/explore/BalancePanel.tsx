import { Card } from '@/components/layout/Card';
import { computeBalance, metaboliteName, type PathwayIndex } from '@/engine/pathwayModel';
import gameStyles from '@/components/game/game.module.css';
import styles from '@/routes/routes.module.css';

const COFACTOR_LABEL: Record<string, string> = {
  nadh: 'NADH',
  fadh2: 'FADH₂',
  nadph: 'NADPH',
};

/** The balance sheet is computed from the reaction list, never typed by hand. */
export function BalancePanel({ index }: { index: PathwayIndex }) {
  const balance = computeBalance(index.pathway);
  const cells: { label: string; value: string }[] = [
    { label: 'ATP consumed', value: String(balance.atpConsumed) },
    { label: 'ATP produced', value: String(balance.atpProduced) },
    { label: 'Net ATP', value: `${balance.netAtp > 0 ? '+' : ''}${balance.netAtp}` },
    ...Object.entries(balance.cofactors).map(([key, value]) => ({
      label: COFACTOR_LABEL[key] ?? key.toUpperCase(),
      value: String(value),
    })),
    ...balance.outputs.map((output) => ({
      label: metaboliteName(index, output.metaboliteId),
      value: String(output.count),
    })),
  ];

  return (
    <Card>
      <h3 className={styles.detailTitle}>Per {index.pathway.input ?? 'molecule'}</h3>
      <div className={styles.balanceGrid} style={{ marginTop: 'var(--space-3)' }}>
        {cells.map((cell) => (
          <div className={gameStyles.stat} key={cell.label}>
            <span className={gameStyles.statLabel}>{cell.label}</span>
            <span className={gameStyles.statValue}>{cell.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
