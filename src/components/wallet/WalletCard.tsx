import { Wallet } from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
import { Wallet as WalletType } from '@/stores/appStore';

interface WalletCardProps {
  wallet: WalletType;
  isSelected?: boolean;
  onClick?: () => void;
}

const walletIcons = {
  main: '💳',
  task: '⚡',
  royalty: '👑',
};

const walletColors = {
  main: 'from-primary/20 to-primary/5',
  task: 'from-success/20 to-success/5',
  royalty: 'from-alpha/20 to-alpha/5',
};

export function WalletCard({ wallet, isSelected, onClick }: WalletCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full p-4 rounded-xl border transition-all duration-300',
        'bg-gradient-to-br',
        walletColors[wallet.type],
        isSelected 
          ? 'border-alpha ring-2 ring-alpha/30' 
          : 'border-border hover:border-primary/50',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{walletIcons[wallet.type]}</span>
          <div className="text-left">
            <p className="font-medium text-foreground">{wallet.label}</p>
            <p className="text-xs text-muted-foreground">{wallet.description}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold alpha-text">₳</span>
        <span className="text-2xl font-bold text-foreground">
          {formatAlpha(wallet.balance)}
        </span>
      </div>
    </button>
  );
}
