-- Create loan status enum
CREATE TYPE public.loan_status AS ENUM ('pending', 'active', 'repaid', 'defaulted', 'cancelled');

-- Create loans table for P2P lending
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  principal_amount NUMERIC NOT NULL CHECK (principal_amount > 0),
  interest_rate NUMERIC NOT NULL DEFAULT 3.00,
  interest_amount NUMERIC GENERATED ALWAYS AS (principal_amount * interest_rate / 100) STORED,
  processing_fee NUMERIC GENERATED ALWAYS AS (principal_amount * 0.008) STORED,
  total_repayment NUMERIC GENERATED ALWAYS AS (principal_amount + (principal_amount * interest_rate / 100)) STORED,
  term_days INTEGER NOT NULL DEFAULT 7,
  status loan_status NOT NULL DEFAULT 'pending',
  escrow_wallet_id UUID REFERENCES wallets(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  repaid_at TIMESTAMPTZ,
  CONSTRAINT valid_status_transition CHECK (
    (status = 'pending' AND borrower_id IS NULL) OR
    (status IN ('active', 'repaid', 'defaulted') AND borrower_id IS NOT NULL) OR
    (status = 'cancelled')
  )
);

-- Enable RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loans
CREATE POLICY "Users can view their own loans as lender or borrower"
ON public.loans FOR SELECT
USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

CREATE POLICY "Users can view pending offers"
ON public.loans FOR SELECT
USING (status = 'pending');

CREATE POLICY "Admins can view all loans"
ON public.loans FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all loans"
ON public.loans FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create loan_transactions table for audit trail
CREATE TABLE public.loan_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('escrow_lock', 'disbursement', 'repayment', 'auto_deduct', 'rescue_credit')),
  amount NUMERIC NOT NULL,
  from_wallet_id UUID REFERENCES wallets(id),
  to_wallet_id UUID REFERENCES wallets(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_transactions
CREATE POLICY "Users can view own loan transactions"
ON public.loan_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all loan transactions"
ON public.loan_transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "No direct inserts from clients"
ON public.loan_transactions FOR INSERT
WITH CHECK (false);

-- Create indexes for performance
CREATE INDEX idx_loans_lender ON public.loans(lender_id);
CREATE INDEX idx_loans_borrower ON public.loans(borrower_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_due_at ON public.loans(due_at) WHERE status = 'active';
CREATE INDEX idx_loan_transactions_loan ON public.loan_transactions(loan_id);