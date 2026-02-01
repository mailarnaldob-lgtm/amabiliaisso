import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TickerItem {
  id: string;
  symbol: string;
  price: number;
  change: number;
  volume: string;
}

/**
 * 2026 Sticky Trading Ticker
 * Obsidian/Cyan design with JetBrains Mono
 */
export function StickyTradingTicker() {
  const [tickerData, setTickerData] = useState<TickerItem[]>([
    { id: '1', symbol: '₳/PHP', price: 1.00, change: 0.00, volume: '∞' },
    { id: '2', symbol: 'LEND', price: 3.00, change: 0.00, volume: '15K' },
    { id: '3', symbol: 'TASK', price: 90.00, change: 2.50, volume: '8.2K' },
    { id: '4', symbol: 'REF', price: 50.00, change: 0.00, volume: '42K' },
  ]);

  const [isScrolling, setIsScrolling] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerData(prev => prev.map(item => ({
        ...item,
        price: item.symbol === '₳/PHP' 
          ? 1.00
          : item.price + (Math.random() - 0.5) * 0.1,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={cn(
        "fixed bottom-20 left-0 right-0 z-30",
        "bg-card/95 backdrop-blur-xl",
        "border-t border-border",
        "py-2 px-4",
        "md:hidden"
      )}
    >
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        {/* Live Indicator */}
        <div className="flex items-center gap-1 shrink-0">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
        </div>
        
        {/* Ticker Items */}
        <div 
          className={cn(
            "flex items-center gap-6",
            isScrolling && "animate-scroll"
          )}
        >
          {tickerData.map((item) => (
            <TickerItemDisplay key={item.id} item={item} />
          ))}
          
          {tickerData.map((item) => (
            <TickerItemDisplay key={`dup-${item.id}`} item={item} />
          ))}
        </div>
      </div>
      
      {/* Trading Floor Label */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <span className="text-[8px] text-muted-foreground font-mono tracking-widest uppercase">
          Trading Floor
        </span>
      </div>
    </div>
  );
}

function TickerItemDisplay({ item }: { item: TickerItem }) {
  const isPositive = item.change > 0;
  const isNeutral = item.change === 0;
  
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs font-semibold text-foreground">{item.symbol}</span>
      <span className="text-xs text-muted-foreground font-mono">
        {item.price.toFixed(2)}%
      </span>
      <div className={cn(
        "flex items-center gap-0.5 text-[10px]",
        isPositive && "text-primary",
        !isPositive && !isNeutral && "text-destructive",
        isNeutral && "text-muted-foreground"
      )}>
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {!isPositive && !isNeutral && <TrendingDown className="h-3 w-3" />}
        <span>{isNeutral ? '0.00' : (isPositive ? '+' : '') + item.change.toFixed(2)}%</span>
      </div>
      <span className="text-[10px] text-muted-foreground">{item.volume}</span>
    </div>
  );
}
