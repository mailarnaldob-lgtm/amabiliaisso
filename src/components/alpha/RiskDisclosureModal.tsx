import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  Percent, 
  Lock,
  FileText,
  CheckCircle2
} from 'lucide-react';

interface RiskDisclosureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  cycleType: 'lend' | 'borrow';
  amount: number;
}

export function RiskDisclosureModal({ 
  open, 
  onOpenChange, 
  onAccept,
  cycleType,
  amount
}: RiskDisclosureModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isNearBottom) {
      setHasScrolled(true);
    }
  };

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  const resetState = () => {
    setHasScrolled(false);
    setAcknowledged(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Disclosure Statement
          </DialogTitle>
          <DialogDescription>
            Please read and acknowledge before proceeding
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {cycleType === 'lend' ? 'Lending' : 'Borrowing'} ₳{amount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[250px] border rounded-lg p-4" onScrollCapture={handleScroll}>
          <div className="space-y-4 text-sm">
            <section>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Nature of Service
              </h4>
              <p className="text-muted-foreground">
                The ₳LPHA Smart Finance service facilitates peer-to-peer credit allocation 
                within a closed-loop ecosystem. All transactions involve internal system 
                credits (₳) which are non-monetary units with no cash value outside the platform.
              </p>
            </section>

            <section>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Cycle Terms
              </h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Lock Period: 168 hours (7 days) from commitment</li>
                <li>• Entry Fee: 1% of principal (deducted immediately)</li>
                <li>• Variable Rate: Up to 3% (not guaranteed)</li>
                <li>• Settlement: Subject to system liquidity and cycle performance</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Risk Factors
              </h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>No Guarantee:</strong> Returns are variable and may be delayed</li>
                <li>• <strong>Lock-up Risk:</strong> Funds cannot be withdrawn during the cycle</li>
                <li>• <strong>Counterparty Risk:</strong> Borrower defaults may affect settlements</li>
                <li>• <strong>System Risk:</strong> Platform reserves may affect payout timing</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Circuit Breakers
              </h4>
              <p className="text-muted-foreground">
                The system employs automatic circuit breakers based on reserve ratios. 
                During stress conditions, new cycles may be paused and withdrawals delayed 
                to protect ecosystem stability.
              </p>
            </section>

            <section>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Important Notices
              </h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• This is NOT an investment product</li>
                <li>• ₳ Credits are internal system units only</li>
                <li>• No financial advice is provided</li>
                <li>• Past performance does not indicate future results</li>
                <li>• All transactions are logged immutably</li>
              </ul>
            </section>
          </div>
        </ScrollArea>

        {!hasScrolled && (
          <p className="text-xs text-muted-foreground text-center">
            ↓ Scroll to read full disclosure
          </p>
        )}

        <div className="flex items-start gap-2">
          <Checkbox 
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked === true)}
            disabled={!hasScrolled}
          />
          <label 
            htmlFor="acknowledge" 
            className={`text-sm ${hasScrolled ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            I have read and understand the risks involved. I acknowledge that ₳ Credits 
            are non-monetary and this is not a financial service.
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            disabled={!hasScrolled || !acknowledged}
            onClick={handleAccept}
            className="bg-gradient-to-r from-blue-500 to-indigo-600"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            I Accept & Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
