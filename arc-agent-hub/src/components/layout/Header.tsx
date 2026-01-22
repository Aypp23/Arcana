import { Menu } from 'lucide-react';
import { WalletButton } from '@/components/shared/WalletButton';
import { BalanceCard } from '@/components/shared/BalanceCard';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="p-2 hover:bg-accent rounded-full transition-colors md:hidden"
      >
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <BalanceCard compact />
        <WalletButton />
      </div>
    </header>
  );
}
