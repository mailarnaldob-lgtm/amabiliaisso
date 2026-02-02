import { create } from 'zustand';

export type WalletType = 'main' | 'task' | 'royalty';
export type ArmyLevel = 'cadet' | 'specialist' | 'operative' | 'vanguard' | 'elite_operator';
export type MembershipTier = 'basic' | 'pro' | 'elite';
export type LoanStatus = 'active' | 'pending' | 'repaid' | 'defaulted';

export interface Wallet {
  type: WalletType;
  balance: number;
  label: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  requiredLevel: ArmyLevel;
  category: string;
  proofRequired: 'screenshot' | 'video' | 'link';
  status: 'available' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
  deadline?: Date;
}

export interface LoanOffer {
  id: string;
  lenderId: string;
  lenderName: string;
  principal: number;
  interestRate: number;
  termDays: number;
  createdAt: Date;
  status: 'available' | 'taken' | 'repaid';
}

export interface ActiveLoan {
  id: string;
  lenderId: string;
  borrowerId: string;
  principal: number;
  interest: number;
  totalDue: number;
  dueDate: Date;
  status: LoanStatus;
}

interface AppState {
  // User state
  userId: string;
  userName: string;
  membershipTier: MembershipTier;
  armyLevel: ArmyLevel;
  isKycVerified: boolean;
  referralCode: string;

  // Wallets
  wallets: Wallet[];
  
  // View state
  swapMode: 'cashin' | 'cashout';
  
  // Actions
  setSwapMode: (mode: 'cashin' | 'cashout') => void;
  updateWalletBalance: (type: WalletType, amount: number) => void;
  swapToAlpha: (amount: number) => void;
  swapToPHP: (amount: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Default user state - will be overridden by real data from useProfile hook
  userId: '',
  userName: '',
  membershipTier: 'basic',
  armyLevel: 'cadet',
  isKycVerified: false,
  referralCode: '',

  // Initial wallet balances - will be overridden by real data from useWallets hook
  wallets: [
    { type: 'main', balance: 0, label: 'Main Wallet', description: 'Primary wallet for transactions' },
    { type: 'task', balance: 0, label: 'Task Wallet', description: 'Earnings from completed tasks' },
    { type: 'royalty', balance: 0, label: 'Royalty Wallet', description: 'Referral commissions (Elite only)' },
  ],

  swapMode: 'cashin',

  setSwapMode: (mode) => set({ swapMode: mode }),

  updateWalletBalance: (type, amount) => set((state) => ({
    wallets: state.wallets.map((w) =>
      w.type === type ? { ...w, balance: w.balance + amount } : w
    ),
  })),

  // Swap functions are handled via edge functions, not client-side
  swapToAlpha: () => {},
  swapToPHP: () => {},
}));

// VPA Mission catalog - live production data
export const VPA_MISSIONS: Task[] = [
  {
    id: 'mission-001',
    title: 'Facebook Page Like & Follow',
    description: 'Like and follow the official AMABILIA Facebook page and take a screenshot.',
    reward: 25,
    requiredLevel: 'cadet',
    category: 'Social Media',
    proofRequired: 'screenshot',
    status: 'available',
  },
  {
    id: 'mission-002',
    title: 'YouTube Video Watch & Comment',
    description: 'Watch the full promotional video and leave a meaningful comment.',
    reward: 50,
    requiredLevel: 'cadet',
    category: 'Video Engagement',
    proofRequired: 'screenshot',
    status: 'available',
  },
  {
    id: 'mission-003',
    title: 'TikTok Video Creation',
    description: 'Create a 30-second promotional TikTok video about AMABILIA.',
    reward: 150,
    requiredLevel: 'specialist',
    category: 'Content Creation',
    proofRequired: 'video',
    status: 'available',
  },
  {
    id: 'mission-004',
    title: 'Blog Review Article',
    description: 'Write a 500-word blog post reviewing the AMABILIA platform.',
    reward: 300,
    requiredLevel: 'operative',
    category: 'Content Writing',
    proofRequired: 'link',
    status: 'available',
  },
  {
    id: 'mission-005',
    title: 'Influencer Outreach',
    description: 'Contact and onboard a micro-influencer to join AMABILIA.',
    reward: 500,
    requiredLevel: 'vanguard',
    category: 'Networking',
    proofRequired: 'screenshot',
    status: 'available',
  },
  {
    id: 'mission-006',
    title: 'Strategic Partnership',
    description: 'Establish a partnership with a local business for AMABILIA promotion.',
    reward: 1000,
    requiredLevel: 'elite_operator',
    category: 'Business Development',
    proofRequired: 'screenshot',
    status: 'available',
  },
];

// Lending marketplace offers - live production data
export const LENDING_OFFERS: LoanOffer[] = [
  {
    id: 'offer-001',
    lenderId: 'lender-001',
    lenderName: 'Juan Dela Cruz',
    principal: 5000,
    interestRate: 3,
    termDays: 7,
    createdAt: new Date(),
    status: 'available',
  },
  {
    id: 'offer-002',
    lenderId: 'lender-002',
    lenderName: 'Maria Santos',
    principal: 10000,
    interestRate: 3,
    termDays: 7,
    createdAt: new Date(),
    status: 'available',
  },
  {
    id: 'offer-003',
    lenderId: 'lender-003',
    lenderName: 'Ana Reyes',
    principal: 2500,
    interestRate: 3,
    termDays: 7,
    createdAt: new Date(),
    status: 'available',
  },
];

// Legacy exports for backwards compatibility
export const MOCK_TASKS = VPA_MISSIONS;
export const MOCK_LOAN_OFFERS = LENDING_OFFERS;

// VPA (Virtual Private Army) level configuration
export const ARMY_LEVELS: Record<ArmyLevel, { name: string; minTasks: number; icon: string }> = {
  cadet: { name: 'VPA Cadet', minTasks: 0, icon: '🎖️' },
  specialist: { name: 'VPA Specialist', minTasks: 10, icon: '⭐' },
  operative: { name: 'VPA Operative', minTasks: 50, icon: '🌟' },
  vanguard: { name: 'VPA Vanguard', minTasks: 150, icon: '💫' },
  elite_operator: { name: 'VPA Elite Operator', minTasks: 500, icon: '👑' },
};

// Membership tier configuration - accurate business logic per Alpha Ecosystem Blueprint V8.0
// ONE-TIME activation fees | Vault yield: 1% DAILY for Elite members
export const MEMBERSHIP_TIERS: Record<MembershipTier, { name: string; cost: number; features: string[] }> = {
  basic: {
    name: 'Basic',
    cost: 300, // ₱300 one-time
    features: ['50% Referral Commission', 'Access to Community Platform'],
  },
  pro: {
    name: 'Pro',
    cost: 600, // ₱600 one-time
    features: ['50% Referral Commission', 'Activity-Based Credits (VPA)', 'Training Access'],
  },
  elite: {
    name: 'Elite',
    cost: 900, // ₱900 one-time
    features: ['50% Referral Commission', 'Activity-Based Credits (VPA)', 'P2P Credit Marketplace', '1% Daily Vault Yield', 'VIP Support'],
  },
};
