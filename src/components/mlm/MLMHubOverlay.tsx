/**
 * MLM Hub Overlay - Sovereign V12.0
 * Full-screen genealogy tree and network governance interface
 * 
 * Design System:
 * - Obsidian Black (#050505) background with 85% opacity
 * - Alpha Gold (#FFD700) accents
 * - AnimatedOdometers for all ₳ figures
 * - 15-second RESTful polling (no WebSockets)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Crown, TrendingUp, ChevronDown, ChevronRight,
  Copy, Check, Share2, Star, Zap, Shield, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNetworkStats, useGenealogyTree, GenealogyNode } from '@/hooks/useNetworkStats';
import { useProfile } from '@/hooks/useProfile';
import { OdometerNumber } from '@/components/command/OdometerNumber';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MLMHubOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Rank configuration based on membership tier
const RANK_CONFIG: Record<string, { name: string; icon: any; color: string; glow: string }> = {
  basic: { name: 'Worker', icon: Users, color: 'text-slate-400', glow: '' },
  pro: { name: 'Merchant', icon: Star, color: 'text-blue-400', glow: 'shadow-blue-500/30' },
  expert: { name: 'Broker', icon: Zap, color: 'text-purple-400', glow: 'shadow-purple-500/30' },
  elite: { name: 'Banker', icon: Crown, color: 'text-[#FFD700]', glow: 'shadow-[#FFD700]/30' },
};

// Genealogy Tree Node Component
function TreeNode({ 
  node, 
  level, 
  isExpanded, 
  onToggle, 
  children 
}: { 
  node: GenealogyNode; 
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  children?: GenealogyNode[];
}) {
  const rank = RANK_CONFIG[node.membership_tier || 'basic'] || RANK_CONFIG.basic;
  const RankIcon = rank.icon;
  const hasChildren = children && children.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: level * 0.1 }}
      className="relative"
    >
      {/* Connection line */}
      {level > 0 && (
        <div className="absolute left-0 top-0 w-6 h-full border-l-2 border-[#FFD700]/20" />
      )}
      
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300",
          "bg-[#050505]/60 border border-[#FFD700]/10 hover:border-[#FFD700]/30",
          "ml-4",
          rank.glow && `shadow-lg ${rank.glow}`
        )}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={onToggle}
      >
        {/* Expand/Collapse indicator */}
        {hasChildren && (
          <div className="w-5 h-5 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-[#FFD700]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#FFD700]/60" />
            )}
          </div>
        )}
        {!hasChildren && <div className="w-5" />}

        {/* Rank Icon */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/10",
          rank.glow
        )}>
          <RankIcon className={cn("h-5 w-5", rank.color)} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{node.full_name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs border-[#FFD700]/30", rank.color)}>
              {rank.name}
            </Badge>
            <span className="text-xs text-muted-foreground">
              L{node.level_depth} • {node.direct_referrals} direct
            </span>
          </div>
        </div>

        {/* Earnings from this node */}
        <div className="text-right">
          <p className="text-[#FFD700] font-mono font-bold">
            ₳{node.network_earnings.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">earned</p>
        </div>
      </div>
    </motion.div>
  );
}

export function MLMHubOverlay({ isOpen, onClose }: MLMHubOverlayProps) {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: stats, isLoading: statsLoading } = useNetworkStats();
  const { data: genealogy, isLoading: treeLoading } = useGenealogyTree(5);
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Group genealogy by level for tree rendering
  const genealogyByLevel = (genealogy || []).reduce((acc, node) => {
    const level = node.level_depth;
    if (!acc[level]) acc[level] = [];
    acc[level].push(node);
    return acc;
  }, {} as Record<number, GenealogyNode[]>);

  // Copy referral link
  const copyReferralLink = async () => {
    const referralCode = profile?.referral_code;
    if (!referralCode) return;

    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: 'Referral Link Copied!', description: 'Share this link to grow your network.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Expand all Level 1 nodes by default
  useEffect(() => {
    if (genealogy && genealogy.length > 0) {
      const level1Ids = genealogy.filter(n => n.level_depth === 1).map(n => n.user_id);
      setExpandedNodes(new Set(level1Ids));
    }
  }, [genealogy]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#050505]/95 backdrop-blur-2xl"
          onClick={onClose}
        />

        {/* Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 flex flex-col h-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#FFD700]/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-mono tracking-wider">
                  ROYALTY NETWORK
                </h1>
                <p className="text-sm text-muted-foreground">MLM Genealogy & Governance</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full border border-[#FFD700]/20 hover:bg-[#FFD700]/10"
            >
              <X className="h-5 w-5 text-[#FFD700]" />
            </Button>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-[#FFD700]/10">
            <Card className="bg-[#050505]/60 border-[#FFD700]/10">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Direct Referrals</p>
                <OdometerNumber 
                  value={stats?.direct_referrals || 0} 
                  className="text-2xl font-bold text-[#FFD700]" 
                />
              </CardContent>
            </Card>
            <Card className="bg-[#050505]/60 border-[#FFD700]/10">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Team</p>
                <OdometerNumber 
                  value={stats?.total_team_size || 0} 
                  className="text-2xl font-bold text-emerald-400" 
                />
              </CardContent>
            </Card>
            <Card className="bg-[#050505]/60 border-[#FFD700]/10">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Network Earnings</p>
                <OdometerNumber 
                  value={stats?.total_network_earnings || 0} 
                  prefix="₳"
                  className="text-2xl font-bold text-[#FFD700]" 
                  decimals={2}
                />
              </CardContent>
            </Card>
            <Card className="bg-[#050505]/60 border-[#FFD700]/10">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">This Month</p>
                <OdometerNumber 
                  value={stats?.this_month_earnings || 0} 
                  prefix="₳"
                  className="text-2xl font-bold text-purple-400" 
                  decimals={2}
                />
              </CardContent>
            </Card>
          </div>

          {/* Referral Share Card */}
          <div className="p-4 border-b border-[#FFD700]/10">
            <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/5 border-[#FFD700]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Referral Code</p>
                    <p className="text-2xl font-bold font-mono text-[#FFD700] tracking-wider">
                      {profile?.referral_code || '------'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyReferralLink}
                      className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                    >
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Logic Explanation */}
          <div className="px-4 py-3 bg-[#050505]/40 border-b border-[#FFD700]/10">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#FFD700] mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="text-[#FFD700] font-semibold mb-1">Network Commission Logic</p>
                <p className="text-muted-foreground">
                  <strong className="text-white">EXPERT & ELITE</strong> members earn <strong className="text-[#FFD700]">10% overrides</strong> on 
                  Level 1 & 2 downline task completions. Commissions are instantly credited to your 
                  <strong className="text-purple-400"> Royalty Wallet</strong> via atomic database transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Genealogy Tree */}
          <ScrollArea className="flex-1 p-4">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#FFD700]" />
                Your Downline Network
              </h2>
              <p className="text-sm text-muted-foreground">
                Click on nodes to expand/collapse. Shows up to 5 levels deep.
              </p>
            </div>

            {treeLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full" />
              </div>
            ) : (genealogy?.length || 0) === 0 ? (
              <Card className="bg-[#050505]/60 border-[#FFD700]/10">
                <CardContent className="p-8 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-lg font-semibold text-white mb-2">No Team Members Yet</p>
                  <p className="text-muted-foreground mb-4">
                    Share your referral code to start building your network!
                  </p>
                  <Button
                    onClick={copyReferralLink}
                    className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Referral Link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {genealogy?.map((node) => {
                  // Get children for this node
                  const children = genealogy.filter(n => n.upline_id === node.user_id);
                  const isExpanded = expandedNodes.has(node.user_id);

                  // Only render top-level nodes (level 1) directly
                  if (node.level_depth !== 1) return null;

                  return (
                    <div key={node.user_id} className="space-y-2">
                      <TreeNode
                        node={node}
                        level={0}
                        isExpanded={isExpanded}
                        onToggle={() => toggleNode(node.user_id)}
                        children={children}
                      />
                      
                      {/* Render children if expanded */}
                      {isExpanded && children.length > 0 && (
                        <div className="ml-6 space-y-2">
                          {children.map((child) => (
                            <TreeNode
                              key={child.user_id}
                              node={child}
                              level={1}
                              isExpanded={expandedNodes.has(child.user_id)}
                              onToggle={() => toggleNode(child.user_id)}
                              children={genealogy.filter(n => n.upline_id === child.user_id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Bottom padding for safe area */}
          <div className="h-24" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
