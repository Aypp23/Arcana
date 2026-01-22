import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  compact?: boolean;
}

export function BalanceCard({ compact = false }: BalanceCardProps) {
  const { balance, isConnected } = useWallet();

  if (!isConnected) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 liquid-glass-button text-sm",
      compact ? "text-xs" : ""
    )}>
      <span className="font-medium">${balance.toFixed(2)}</span>
      <span className="text-muted-foreground">USDC</span>
    </div>
  );
}
