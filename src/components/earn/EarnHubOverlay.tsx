/**
 * EARN HUB OVERLAY - SOVEREIGN V11.0
 * Complete overhaul with 20 Philippine Brand Missions
 * 
 * Architecture:
 * - RESTful polling (15-second intervals)
 * - No WebSockets or realtime subscriptions
 * - Standard Supabase storage for proof uploads
 * - AnimatedOdometers for reward figures
 * 
 * Theme: Obsidian Black (#050505) + Alpha Gold (#FFD700)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Target, CheckCircle2, Clock, Award, Zap, Upload, 
  ExternalLink, Info, FileCheck, AlertCircle, Star,
  Youtube, Facebook, Play, Users, Music, Camera, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EliteButton } from '@/components/ui/elite-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTaskSubmissions, useTaskStats } from '@/hooks/useTasks';
import { useProfile } from '@/hooks/useProfile';
import { ARMY_LEVELS, ArmyLevel } from '@/stores/appStore';
import { formatDistanceToNow } from 'date-fns';
import { OdometerNumber } from '@/components/command/OdometerNumber';
import { TaskSubmissionModal } from '@/components/alpha/TaskSubmissionModal';

interface EarnHubOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// PHILIPPINE BRAND MISSIONS - 40 ACTIVE TASKS (FB, YT, TikTok, Instagram)
// ═══════════════════════════════════════════════════════════════════════════

export type MissionPlatform = 'facebook' | 'youtube' | 'tiktok' | 'instagram';

export interface PhilippineMission {
  id: string;
  title: string;
  description: string;
  category: MissionPlatform;
  brand: string;
  action: string;
  reward: number;
  proof_type: 'screenshot' | 'link';
  target_url: string;
  icon: MissionPlatform;
  is_active: boolean;
}

export const PHILIPPINE_MISSIONS: PhilippineMission[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // FACEBOOK MISSIONS (10 Tasks - Follow/Like)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'ph-fb-001',
    title: 'Coca-Cola Philippines',
    description: 'Follow the official Coca-Cola Philippines Facebook page',
    category: 'facebook',
    brand: 'Coca-Cola PH',
    action: 'Follow Page',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/CocaColaPH',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-002',
    title: 'Jollibee',
    description: 'Like the latest post on Jollibee\'s official Facebook page',
    category: 'facebook',
    brand: 'Jollibee',
    action: 'Like Latest Post',
    reward: 8,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/JollibeePhilippines',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-003',
    title: 'SM Supermalls',
    description: 'Follow SM Supermalls official Facebook page',
    category: 'facebook',
    brand: 'SM Supermalls',
    action: 'Follow Page',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/saborandmix',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-004',
    title: 'GCash',
    description: 'Like and share any GCash Facebook post',
    category: 'facebook',
    brand: 'GCash',
    action: 'Like & Share Post',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/gcaborandmix',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-005',
    title: 'Angkas',
    description: 'Follow Angkas official Facebook page',
    category: 'facebook',
    brand: 'Angkas',
    action: 'Follow Page',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/angaborandmix',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-006',
    title: 'Shopee PH',
    description: 'Like any Shopee Philippines Facebook post',
    category: 'facebook',
    brand: 'Shopee PH',
    action: 'Like Post',
    reward: 8,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/ShopeePH',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-007',
    title: 'Lazada PH',
    description: 'Follow Lazada Philippines official Facebook page',
    category: 'facebook',
    brand: 'Lazada PH',
    action: 'Follow Page',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/LazadaPhilippines',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-008',
    title: 'Globe Telecom',
    description: 'Like any Globe Telecom Facebook post',
    category: 'facebook',
    brand: 'Globe Telecom',
    action: 'Like Post',
    reward: 8,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/globeph',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-009',
    title: 'Smart Communications',
    description: 'Follow Smart Communications official Facebook page',
    category: 'facebook',
    brand: 'Smart',
    action: 'Follow Page',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/SmartCommunications',
    icon: 'facebook',
    is_active: true,
  },
  {
    id: 'ph-fb-010',
    title: 'Meralco',
    description: 'Like the latest update on Meralco Facebook page',
    category: 'facebook',
    brand: 'Meralco',
    action: 'Like Latest Update',
    reward: 8,
    proof_type: 'screenshot',
    target_url: 'https://www.facebook.com/meralco',
    icon: 'facebook',
    is_active: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // YOUTUBE MISSIONS (10 Tasks - Subscribe/Watch)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'ph-yt-001',
    title: 'Vivamax',
    description: 'Subscribe to Vivamax official YouTube channel',
    category: 'youtube',
    brand: 'Vivamax',
    action: 'Subscribe Channel',
    reward: 15,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@VivamaxPH',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-002',
    title: 'ABS-CBN Entertainment',
    description: 'Watch the latest video on ABS-CBN Entertainment',
    category: 'youtube',
    brand: 'ABS-CBN',
    action: 'Watch Latest Video',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@ABSCBNEntertainment',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-003',
    title: 'GMA Integrated News',
    description: 'Subscribe to GMA Integrated News YouTube channel',
    category: 'youtube',
    brand: 'GMA News',
    action: 'Subscribe Channel',
    reward: 15,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@gaborandmix',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-004',
    title: 'Wish 107.5',
    description: 'Watch any performance video on Wish 107.5 channel',
    category: 'youtube',
    brand: 'Wish 107.5',
    action: 'Watch Performance',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@Wish1075',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-005',
    title: 'Cong TV',
    description: 'Subscribe to Cong TV official YouTube channel',
    category: 'youtube',
    brand: 'Cong TV',
    action: 'Subscribe Channel',
    reward: 15,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@CongTV',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-006',
    title: 'Ivana Alawi',
    description: 'Subscribe to Ivana Alawi official YouTube channel',
    category: 'youtube',
    brand: 'Ivana Alawi',
    action: 'Subscribe Channel',
    reward: 15,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@IvanaAlawi',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-007',
    title: 'Raffy Tulfo in Action',
    description: 'Watch any video on Raffy Tulfo in Action',
    category: 'youtube',
    brand: 'Raffy Tulfo',
    action: 'Watch Video',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@raffytaborandmix',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-008',
    title: 'Eat Bulaga',
    description: 'Subscribe to Eat Bulaga official YouTube channel',
    category: 'youtube',
    brand: 'Eat Bulaga',
    action: 'Subscribe Channel',
    reward: 15,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@EatBulaga',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-009',
    title: 'Erwan Heussaff (FEATR)',
    description: 'Watch any video on Erwan Heussaff\'s FEATR channel',
    category: 'youtube',
    brand: 'FEATR',
    action: 'Watch Video',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@FEATR',
    icon: 'youtube',
    is_active: true,
  },
  {
    id: 'ph-yt-010',
    title: 'Pinoy Big Brother',
    description: 'Subscribe to Pinoy Big Brother official YouTube channel',
    category: 'youtube',
    brand: 'PBB',
    action: 'Subscribe Channel',
    reward: 15,
    proof_type: 'screenshot',
    target_url: 'https://www.youtube.com/@PinoyBigBrother',
    icon: 'youtube',
    is_active: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TIKTOK MISSIONS (10 Tasks - Viral Reach & Follow) - V12.0 EXPANSION
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'ph-tt-001',
    title: 'FoodPanda PH',
    description: 'Follow FoodPanda PH and heart their latest video',
    category: 'tiktok',
    brand: 'FoodPanda PH',
    action: 'Follow & Heart Video',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@foodpanda_ph',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-002',
    title: 'Vice Cosmetics',
    description: 'Heart the latest clip on Vice Cosmetics TikTok',
    category: 'tiktok',
    brand: 'Vice Cosmetics',
    action: 'Heart Latest Clip',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@vicecosmetics',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-003',
    title: 'Smart Communications',
    description: 'Follow Smart Communications TikTok account',
    category: 'tiktok',
    brand: 'Smart',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@smartcommunications',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-004',
    title: 'BDO Unibank',
    description: 'Watch any tip video on BDO Unibank TikTok',
    category: 'tiktok',
    brand: 'BDO Unibank',
    action: 'Watch Tip Video',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@bdounibank',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-005',
    title: 'Chowking',
    description: 'Follow Chowking and heart any video',
    category: 'tiktok',
    brand: 'Chowking',
    action: 'Follow & Heart',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@chowkingph',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-006',
    title: 'Mang Inasal',
    description: 'Follow Mang Inasal TikTok account',
    category: 'tiktok',
    brand: 'Mang Inasal',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@manginasalph',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-007',
    title: 'Grab Philippines',
    description: 'Heart the latest promo video on Grab Philippines',
    category: 'tiktok',
    brand: 'Grab PH',
    action: 'Heart Latest Promo',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@grabph',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-008',
    title: 'Maya PH',
    description: 'Follow Maya PH TikTok account',
    category: 'tiktok',
    brand: 'Maya PH',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@mayaph',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-009',
    title: 'Bench/ Official',
    description: 'Heart any fashion clip on Bench TikTok',
    category: 'tiktok',
    brand: 'Bench/',
    action: 'Heart Fashion Clip',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@bench',
    icon: 'tiktok',
    is_active: true,
  },
  {
    id: 'ph-tt-010',
    title: 'Penshoppe',
    description: 'Follow Penshoppe TikTok account',
    category: 'tiktok',
    brand: 'Penshoppe',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.tiktok.com/@penshoppe',
    icon: 'tiktok',
    is_active: true,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INSTAGRAM MISSIONS (10 Tasks - Followers & Stories) - V12.0 EXPANSION
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'ph-ig-001',
    title: 'Starbucks Philippines',
    description: 'Follow Starbucks Philippines Instagram account',
    category: 'instagram',
    brand: 'Starbucks PH',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/starbucksph/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-002',
    title: 'National Book Store',
    description: 'Like the latest photo on National Book Store Instagram',
    category: 'instagram',
    brand: 'National Book Store',
    action: 'Like Latest Photo',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/nationalbookstore/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-003',
    title: 'Uniqlo Philippines',
    description: 'Follow Uniqlo Philippines Instagram account',
    category: 'instagram',
    brand: 'Uniqlo PH',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/uniqlophofficial/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-004',
    title: 'H&M Philippines',
    description: 'Like the latest post on H&M Philippines Instagram',
    category: 'instagram',
    brand: 'H&M PH',
    action: 'Like Latest Post',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/hm_ph/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-005',
    title: 'Watsons Philippines',
    description: 'Follow Watsons Philippines Instagram account',
    category: 'instagram',
    brand: 'Watsons PH',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/waborandmixph/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-006',
    title: 'Sunnies Studios',
    description: 'Like the latest post on Sunnies Studios Instagram',
    category: 'instagram',
    brand: 'Sunnies Studios',
    action: 'Like Latest Post',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/sunniesstudios/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-007',
    title: 'Zalora PH',
    description: 'Follow Zalora PH Instagram account',
    category: 'instagram',
    brand: 'Zalora PH',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/zaborandmixph/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-008',
    title: 'Toyota Philippines',
    description: 'Like the latest car post on Toyota Philippines',
    category: 'instagram',
    brand: 'Toyota PH',
    action: 'Like Latest Car Post',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/toyotamotor_ph/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-009',
    title: 'KFC Philippines',
    description: 'Follow KFC Philippines Instagram account',
    category: 'instagram',
    brand: 'KFC PH',
    action: 'Follow Account',
    reward: 12,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/kfcphilippines/',
    icon: 'instagram',
    is_active: true,
  },
  {
    id: 'ph-ig-010',
    title: "Shakey's PH",
    description: "Like the latest post on Shakey's Philippines Instagram",
    category: 'instagram',
    brand: "Shakey's PH",
    action: 'Like Latest Post',
    reward: 10,
    proof_type: 'screenshot',
    target_url: 'https://www.instagram.com/shakeysph/',
    icon: 'instagram',
    is_active: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BUSINESS LOGIC EXPLANATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function BusinessLogicSection() {
  return (
    <Card className="bg-[#050505]/80 border-[#FFD700]/20 backdrop-blur-xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-[#FFD700]" />
          <h3 className="font-bold text-[#FFD700]">Task/Rewards Business Logic</h3>
        </div>
        
        <div className="space-y-3 text-sm text-zinc-300">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-[#FFD700]/10">
              <ExternalLink className="h-4 w-4 text-[#FFD700]" />
            </div>
            <div>
              <p className="font-semibold text-white">1. Start Mission (Redirect)</p>
              <p className="text-zinc-400">Click "Start Mission" to open the target URL in a new tab. Complete the action externally.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-emerald-500/10">
              <Upload className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">2. Mission Accomplished (Upload Proof)</p>
              <p className="text-zinc-400">Upload a screenshot as evidence of task completion. Proofs are stored securely.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white">3. Admin Review (1-24 hrs)</p>
              <p className="text-zinc-400">Admins verify proofs. <span className="text-[#FFD700]">Only Admins can view uploaded proofs.</span></p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-[#FFD700]/10">
              <Zap className="h-4 w-4 text-[#FFD700]" />
            </div>
            <div>
              <p className="font-semibold text-white">4. ABC Vault Injection</p>
              <p className="text-zinc-400">Upon approval, ₳ Credits are instantly injected into your <span className="text-[#FFD700]">Task Wallet</span>.</p>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-[#FFD700]/10">
          <p className="text-xs text-zinc-500">
            <span className="text-[#FFD700]">90/10 Split:</span> You receive 90% of the reward. 10% supports platform operations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED STATS HEADER WITH ODOMETERS
// ═══════════════════════════════════════════════════════════════════════════

function StatsHeader({ stats }: { stats: ReturnType<typeof useTaskStats> }) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-[#050505]/60 rounded-xl border border-[#FFD700]/20 backdrop-blur-xl">
      <div className="text-center">
        <div className="text-2xl font-bold text-[#FFD700]">
          <OdometerNumber value={stats.totalCreditsEarned} prefix="₳" />
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Total Earned</p>
      </div>
      <div className="text-center border-x border-[#FFD700]/10">
        <div className="text-2xl font-bold text-blue-400">
          <OdometerNumber value={stats.totalPending} />
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Pending</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-emerald-400">
          <OdometerNumber value={stats.todayCompleted} />
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Today</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VPA LEVEL CARD (Performance-Based Leveling)
// ═══════════════════════════════════════════════════════════════════════════

function VPALevelCard({ completedCount }: { completedCount: number }) {
  const armyLevel: ArmyLevel = completedCount >= 500 ? 'elite_operator' 
    : completedCount >= 150 ? 'vanguard'
    : completedCount >= 50 ? 'operative'
    : completedCount >= 10 ? 'specialist'
    : 'cadet';
    
  const levelInfo = ARMY_LEVELS[armyLevel];
  const nextLevel = Object.entries(ARMY_LEVELS).find(
    ([_, info]) => info.minTasks > levelInfo.minTasks
  );

  const progressToNext = nextLevel
    ? Math.min(100, (completedCount / nextLevel[1].minTasks) * 100)
    : 100;

  return (
    <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#050505] border-[#FFD700]/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/30 flex items-center justify-center text-2xl">
              {levelInfo.icon}
            </div>
            <div>
              <h3 className="font-bold text-white">{levelInfo.name}</h3>
              <p className="text-xs text-zinc-500">VPA Level</p>
            </div>
          </div>
          <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
            <Award className="h-3 w-3 mr-1" />
            {completedCount} Completed
          </Badge>
        </div>

        {nextLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Progress to {nextLevel[1].name}
              </span>
              <span className="text-[#FFD700] font-mono">
                {completedCount}/{nextLevel[1].minTasks}
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHILIPPINE MISSION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function PhilippineMissionCard({ 
  mission, 
  onStartMission,
  isSubmitted,
  isAccountInactive,
  onActivateClick
}: { 
  mission: PhilippineMission; 
  onStartMission: (mission: PhilippineMission) => void;
  isSubmitted: boolean;
  isAccountInactive?: boolean;
  onActivateClick?: () => void;
}) {
  // Platform-specific styling
  const platformConfig: Record<MissionPlatform, { icon: typeof Youtube; bg: string; color: string; actionBg: string }> = {
    youtube: {
      icon: Youtube,
      bg: 'from-red-600/20 to-red-800/10 border-red-500/20',
      color: 'text-red-500',
      actionBg: 'bg-red-500/5 border-red-500/20 text-red-400',
    },
    facebook: {
      icon: Facebook,
      bg: 'from-blue-600/20 to-blue-800/10 border-blue-500/20',
      color: 'text-blue-500',
      actionBg: 'bg-blue-500/5 border-blue-500/20 text-blue-400',
    },
    tiktok: {
      icon: Music, // TikTok-like icon
      bg: 'from-cyan-400/20 to-pink-500/10 border-cyan-400/20',
      color: 'text-cyan-400',
      actionBg: 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400',
    },
    instagram: {
      icon: Camera, // Instagram-like icon
      bg: 'from-pink-500/20 to-purple-600/10 border-pink-500/20',
      color: 'text-pink-500',
      actionBg: 'bg-pink-500/5 border-pink-500/20 text-pink-400',
    },
  };
  
  const config = platformConfig[mission.icon];
  const IconComponent = config.icon;

  // Locked state for inactive accounts
  const isLocked = isAccountInactive && !isSubmitted;
  
  return (
    <Card className={cn(
      "bg-[#050505]/80 border-[#FFD700]/10 transition-all duration-300 backdrop-blur-xl group relative",
      isSubmitted ? "opacity-50" : isLocked ? "opacity-70" : "hover:border-[#FFD700]/40"
    )}>
      {/* Lock overlay for inactive accounts */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="p-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 w-fit mx-auto mb-2">
              <Lock className="h-5 w-5 text-[#FFD700]" />
            </div>
            <p className="text-xs text-zinc-400 mb-2">Account inactive. Activation required to earn ₳.</p>
            <button
              onClick={onActivateClick}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 transition-opacity"
            >
              ACTIVATE ACCOUNT TO UNLOCK
            </button>
          </div>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br border transition-colors",
            config.bg,
            !isSubmitted && !isLocked && "group-hover:border-[#FFD700]/40"
          )}>
            <IconComponent className={cn("h-6 w-6", config.color)} />
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white line-clamp-1">{mission.title}</h4>
                  {isSubmitted && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Done
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{mission.description}</p>
              </div>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 font-mono flex-shrink-0">
                <OdometerNumber value={mission.reward} prefix="+₳" className="text-xs" />
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className={cn("px-2 py-0.5 rounded border capitalize", config.actionBg)}>
                  {mission.action}
                </span>
              </div>
              
              {!isSubmitted && !isLocked && (
                <EliteButton
                  size="sm"
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold hover:opacity-90 h-8"
                  onClick={() => onStartMission(mission)}
                >
                  <Target className="h-3.5 w-3.5 mr-1" />
                  Start
                </EliteButton>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBMISSION HISTORY CARD
// ═══════════════════════════════════════════════════════════════════════════

function SubmissionCard({ submission }: { submission: any }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'blue', label: 'Under Review', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    approved: { icon: CheckCircle2, color: 'emerald', label: 'Approved', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    rejected: { icon: AlertCircle, color: 'red', label: 'Rejected', bg: 'bg-red-500/10', border: 'border-red-500/30' }
  };
  
  const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true });
  
  return (
    <Card className={cn(
      "bg-[#050505]/80 backdrop-blur-xl transition-all",
      config.border
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2.5 rounded-lg", config.bg)}>
            <Icon className={cn(
              "h-5 w-5",
              submission.status === 'approved' && "text-emerald-400",
              submission.status === 'pending' && "text-blue-400",
              submission.status === 'rejected' && "text-red-400"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-white line-clamp-1">
                  {submission.task?.title || 'Mission'}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Submitted {timeAgo}
                </p>
              </div>
              <Badge className={cn(
                "text-xs flex-shrink-0",
                submission.status === 'approved' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                submission.status === 'pending' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                submission.status === 'rejected' && "bg-red-500/20 text-red-400 border-red-500/30"
              )}>
                {config.label}
              </Badge>
            </div>
            
            {submission.status === 'approved' && submission.reward_amount && (
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                <Zap className="h-3 w-3" />
                <span>+₳{submission.reward_amount} credited</span>
              </div>
            )}
            
            {submission.status === 'rejected' && submission.rejection_reason && (
              <p className="mt-2 text-xs text-red-400">
                Reason: {submission.rejection_reason}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-[#050505]/60 border-[#FFD700]/10">
      <CardContent className="p-8 text-center">
        <div className="mx-auto text-zinc-600 mb-3">
          {icon}
        </div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EARN HUB OVERLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function EarnHubOverlay({ isOpen, onClose }: EarnHubOverlayProps) {
  const { data: profile } = useProfile();
  const { data: submissions, isLoading: submissionsLoading, refetch: refetchSubmissions } = useTaskSubmissions();
  const stats = useTaskStats();
  
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | MissionPlatform>('all');
  const [selectedMission, setSelectedMission] = useState<PhilippineMission | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  // SOVEREIGN V12.0: Check if account is inactive (no membership_tier)
  const isAccountInactive = !profile?.membership_tier;

  // Handler to redirect to activation flow
  const handleActivateClick = useCallback(() => {
    onClose(); // Close overlay and redirect to dashboard activation module
    // The user will be redirected to the main dashboard where ACTIVATE ACCOUNT card is visible
  }, [onClose]);

  // 15-second RESTful polling for live data (NO WebSockets)
  useEffect(() => {
    if (!isOpen) return;
    
    const pollInterval = setInterval(() => {
      refetchSubmissions();
    }, 15000);
    
    return () => clearInterval(pollInterval);
  }, [isOpen, refetchSubmissions]);

  // Get submitted task IDs from database submissions
  const submittedTaskIds = new Set(submissions?.map(s => s.task_id) || []);
  
  // Filter Philippine missions by platform
  const activeMissions = PHILIPPINE_MISSIONS.filter(m => m.is_active);
  const filteredMissions = selectedPlatform === 'all' 
    ? activeMissions 
    : activeMissions.filter(m => m.category === selectedPlatform);

  // Calculate total potential earnings and platform counts
  const totalPotentialEarnings = activeMissions.reduce((sum, m) => sum + m.reward, 0);
  const facebookCount = activeMissions.filter(m => m.category === 'facebook').length;
  const youtubeCount = activeMissions.filter(m => m.category === 'youtube').length;
  const tiktokCount = activeMissions.filter(m => m.category === 'tiktok').length;
  const instagramCount = activeMissions.filter(m => m.category === 'instagram').length;

  // Filter submissions by status
  const pendingSubmissions = submissions?.filter(s => s.status === 'pending') || [];
  const approvedSubmissions = submissions?.filter(s => s.status === 'approved') || [];

  const handleStartMission = useCallback((mission: PhilippineMission) => {
    // Open target URL in new tab
    window.open(mission.target_url, '_blank', 'noopener,noreferrer');
    // Set selected mission for proof submission
    setSelectedMission(mission);
    setSubmissionModalOpen(true);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur - Obsidian Black theme */}
          <motion.div
            className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          
          {/* Overlay Content - Scale-in animation */}
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500]">
                    <Star className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">EARN Hub</h1>
                    <p className="text-xs text-zinc-500">VPA Mission Control • {activeMissions.length} Active Missions</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full bg-[#FFD700]/10 hover:bg-[#FFD700]/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-5 w-5 text-[#FFD700]" />
                </motion.button>
              </div>
              
              {/* Mission Counter Banner - ALL 4 PLATFORMS */}
              <Alert className="border-[#FFD700]/30 bg-[#FFD700]/5 mb-4">
                <FileCheck className="h-4 w-4 text-[#FFD700]" />
                <AlertDescription className="text-xs text-zinc-300">
                  <span className="text-[#FFD700] font-semibold">{activeMissions.length} Active Missions</span> • 
                  <span className="text-blue-400"> {facebookCount} FB</span> • 
                  <span className="text-red-400"> {youtubeCount} YT</span> • 
                  <span className="text-cyan-400"> {tiktokCount} TikTok</span> • 
                  <span className="text-pink-400"> {instagramCount} IG</span> • 
                  Total: <span className="text-[#FFD700] font-mono">₳{totalPotentialEarnings}</span>
                </AlertDescription>
              </Alert>
              
              {/* Stats Header with Odometers */}
              <StatsHeader stats={stats} />
              
              {/* VPA Level Card */}
              <div className="mt-4">
                <VPALevelCard completedCount={stats.totalCompleted} />
              </div>
              
              {/* Business Logic Section */}
              <div className="mt-4">
                <BusinessLogicSection />
              </div>
              
              {/* Platform Filter Tabs - 4 PLATFORMS */}
              <div className="flex flex-wrap gap-2 mt-6 mb-4">
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'all'
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-[#FFD700]/10 text-zinc-400 hover:text-white hover:bg-[#FFD700]/20'
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  All ({activeMissions.length})
                </button>
                <button
                  onClick={() => setSelectedPlatform('facebook')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'facebook'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500/20'
                  )}
                >
                  <Facebook className="h-3.5 w-3.5" />
                  FB ({facebookCount})
                </button>
                <button
                  onClick={() => setSelectedPlatform('youtube')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'youtube'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500/20'
                  )}
                >
                  <Youtube className="h-3.5 w-3.5" />
                  YT ({youtubeCount})
                </button>
                <button
                  onClick={() => setSelectedPlatform('tiktok')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'tiktok'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-cyan-500/10 text-cyan-400 hover:text-white hover:bg-cyan-500/20'
                  )}
                >
                  <Music className="h-3.5 w-3.5" />
                  TikTok ({tiktokCount})
                </button>
                <button
                  onClick={() => setSelectedPlatform('instagram')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'instagram'
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-500/10 text-pink-400 hover:text-white hover:bg-pink-500/20'
                  )}
                >
                  <Camera className="h-3.5 w-3.5" />
                  IG ({instagramCount})
                </button>
              </div>
              
              {/* Tabs for Missions vs History */}
              <Tabs defaultValue="missions" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-[#050505]/60 border border-[#FFD700]/20 rounded-xl mb-4">
                  <TabsTrigger 
                    value="missions" 
                    className="rounded-lg data-[state=active]:bg-[#FFD700] data-[state=active]:text-black"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Missions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="rounded-lg data-[state=active]:bg-[#FFD700] data-[state=active]:text-black"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    History ({submissions?.length || 0})
                  </TabsTrigger>
                </TabsList>
                
                {/* Missions Tab */}
                <TabsContent value="missions" className="space-y-3 mt-0">
                  {submissionsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="bg-[#050505]/80 border-[#FFD700]/10">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-2/3" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredMissions.length > 0 ? (
                    <>
                      {/* Inactive Account Warning Banner */}
                      {isAccountInactive && (
                        <Alert className="border-[#FFD700]/50 bg-[#FFD700]/10 mb-4">
                          <Lock className="h-4 w-4 text-[#FFD700]" />
                          <AlertDescription className="text-xs text-[#FFD700]">
                            <strong>Account Inactive:</strong> Activate your account to start earning ₳ from missions.{' '}
                            <button 
                              onClick={handleActivateClick} 
                              className="underline hover:text-white transition-colors"
                            >
                              Activate Now →
                            </button>
                          </AlertDescription>
                        </Alert>
                      )}
                      {filteredMissions.map((mission) => (
                        <PhilippineMissionCard
                          key={mission.id}
                          mission={mission}
                          onStartMission={handleStartMission}
                          isSubmitted={submittedTaskIds.has(mission.id)}
                          isAccountInactive={isAccountInactive}
                          onActivateClick={handleActivateClick}
                        />
                      ))}
                    </>
                  ) : (
                    <EmptyState
                      icon={<Target className="h-12 w-12" />}
                      title="No Missions Available"
                      description="Check back later for new missions"
                    />
                  )}
                </TabsContent>
                
                {/* History Tab */}
                <TabsContent value="history" className="space-y-3 mt-0">
                  {submissionsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="bg-[#050505]/80 border-[#FFD700]/10">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : submissions && submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <SubmissionCard key={submission.id} submission={submission} />
                    ))
                  ) : (
                    <EmptyState
                      icon={<Clock className="h-12 w-12" />}
                      title="No Submissions Yet"
                      description="Complete missions to see your history"
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
          
          {/* Task Submission Modal */}
          {selectedMission && (
            <TaskSubmissionModal
              open={submissionModalOpen}
              onOpenChange={(open) => {
                setSubmissionModalOpen(open);
                if (!open) setSelectedMission(null);
              }}
              task={{
                id: selectedMission.id,
                title: selectedMission.title,
                description: selectedMission.description,
                category: selectedMission.category,
                required_level: 'cadet',
                proof_type: selectedMission.proof_type,
                reward: selectedMission.reward,
                is_active: selectedMission.is_active,
                created_at: new Date().toISOString(),
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
