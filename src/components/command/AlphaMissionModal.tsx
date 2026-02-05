 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { Card, CardContent } from '@/components/ui/card';
 import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
 import { useSubmitTask, Task } from '@/hooks/useTasks';
 import { RadialProgressClock } from './RadialProgressClock';
 import { formatDistanceToNow, differenceInSeconds, addHours } from 'date-fns';
 import { 
   ExternalLink, 
   Upload, 
   Camera, 
   Video, 
   Link as LinkIcon, 
   CheckCircle2,
   Clock,
   Zap,
   FileCheck,
   Loader2,
   Star,
   AlertCircle
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface AlphaMissionModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   task: Task | null;
 }
 
 type MissionState = 'ready' | 'in-progress' | 'submission';
 
 export function AlphaMissionModal({ open, onOpenChange, task }: AlphaMissionModalProps) {
   const [state, setState] = useState<MissionState>('ready');
   const [proofType, setProofType] = useState<'screenshot' | 'video' | 'link'>('screenshot');
   const [proofFile, setProofFile] = useState<File | null>(null);
   const [proofLink, setProofLink] = useState('');
   const [missionStartTime, setMissionStartTime] = useState<Date | null>(null);
   const submitTask = useSubmitTask();
 
   if (!task) return null;
 
   // Calculate countdown (24h submission window)
   const submissionDeadline = missionStartTime ? addHours(missionStartTime, 24) : null;
   const secondsRemaining = submissionDeadline 
     ? Math.max(0, differenceInSeconds(submissionDeadline, new Date()))
     : 86400; // 24h in seconds
   const progressPercent = (secondsRemaining / 86400) * 100;
 
   const handleStartMission = () => {
     // Open target URL in new tab
     window.open(task.description.includes('http') 
       ? task.description.match(/https?:\/\/[^\s]+/)?.[0] || '#'
       : '#', '_blank');
     setState('in-progress');
     setMissionStartTime(new Date());
   };
 
   const handleMissionComplete = () => {
     setState('submission');
   };
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       // Validate file type (images or videos)
       const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
       if (!isValid) return;
       // Validate file size (max 10MB for video, 5MB for image)
       const maxSize = file.type.startsWith('video/') ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
       if (file.size > maxSize) return;
       setProofFile(file);
     }
   };
 
   const handleSubmit = async () => {
     if (!task) return;
     if ((proofType === 'screenshot' || proofType === 'video') && !proofFile) return;
     if (proofType === 'link' && !proofLink.trim()) return;
 
     await submitTask.mutateAsync({
       taskId: task.id,
       proofType: proofType === 'video' ? 'screenshot' : proofType,
       proofFile: (proofType === 'screenshot' || proofType === 'video') ? proofFile || undefined : undefined,
       proofLink: proofType === 'link' ? proofLink : undefined,
     });
 
     // Reset and close
     setState('ready');
     setProofFile(null);
     setProofLink('');
     setMissionStartTime(null);
     onOpenChange(false);
   };
 
   const handleClose = () => {
     setState('ready');
     setProofFile(null);
     setProofLink('');
     setMissionStartTime(null);
     onOpenChange(false);
   };
 
   const isValid = proofType === 'link' 
     ? !!proofLink.trim() 
     : !!proofFile;
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent 
         className={cn(
           "max-w-[90vw] max-h-[90vh] w-full overflow-hidden p-0",
           "bg-background/95 backdrop-blur-xl border-[#FFD700]/30",
           "shadow-2xl shadow-[#FFD700]/10"
         )}
       >
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           transition={{ 
             type: "spring", 
             stiffness: 400, 
             damping: 30,
             duration: 0.3 
           }}
           className="flex flex-col h-full"
         >
           {/* Header */}
           <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <RadialProgressClock 
                     progress={progressPercent} 
                     size={56} 
                     color="gold"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Clock className="h-5 w-5 text-[#FFD700]/70" />
                   </div>
                 </div>
                 <div>
                   <DialogTitle className="text-lg font-bold text-foreground">
                     {task.title}
                   </DialogTitle>
                   <div className="flex items-center gap-2 mt-1">
                     <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-xs">
                       <Star className="h-3 w-3 mr-1" />
                       {task.category}
                     </Badge>
                     <Badge variant="outline" className="text-xs">
                       +₳{task.reward}
                     </Badge>
                   </div>
                 </div>
               </div>
               {state === 'in-progress' && (
                 <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
                   <Zap className="h-3 w-3 mr-1" />
                   Mission Active
                 </Badge>
               )}
             </div>
           </DialogHeader>
 
           {/* Content */}
           <div className="flex-1 overflow-y-auto p-6">
             <AnimatePresence mode="wait">
               {state === 'ready' && (
                 <motion.div
                   key="ready"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="space-y-6"
                 >
                   {/* Mission Description */}
                   <Card className="bg-muted/30 border-border/50">
                     <CardContent className="p-4">
                       <h3 className="font-semibold text-foreground mb-2">Mission Objective</h3>
                       <p className="text-sm text-muted-foreground">{task.description}</p>
                     </CardContent>
                   </Card>
 
                   {/* Mission Details Grid */}
                   <div className="grid grid-cols-3 gap-3">
                     <Card className="bg-muted/20 border-border/30">
                       <CardContent className="p-3 text-center">
                         <p className="text-xs text-muted-foreground">Reward</p>
                         <p className="text-xl font-bold text-[#FFD700]">₳{task.reward}</p>
                       </CardContent>
                     </Card>
                     <Card className="bg-muted/20 border-border/30">
                       <CardContent className="p-3 text-center">
                         <p className="text-xs text-muted-foreground">Level</p>
                         <p className="text-lg font-semibold capitalize">{task.required_level}</p>
                       </CardContent>
                     </Card>
                     <Card className="bg-muted/20 border-border/30">
                       <CardContent className="p-3 text-center">
                         <p className="text-xs text-muted-foreground">Proof</p>
                         <p className="text-lg font-semibold capitalize">{task.proof_type}</p>
                       </CardContent>
                     </Card>
                   </div>
 
                   {/* Start Mission CTA */}
                   <Button 
                     onClick={handleStartMission}
                     className="w-full h-14 bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-bold text-lg hover:from-amber-400 hover:to-amber-600 transition-all"
                   >
                     <ExternalLink className="h-5 w-5 mr-2" />
                     Start Mission
                   </Button>
 
                   <p className="text-xs text-muted-foreground text-center">
                     Clicking will open the target in a new tab. Return here to submit proof.
                   </p>
                 </motion.div>
               )}
 
               {state === 'in-progress' && (
                 <motion.div
                   key="in-progress"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="space-y-6"
                 >
                   {/* Live Countdown */}
                   <Card className="bg-[#FFD700]/5 border-[#FFD700]/30">
                     <CardContent className="p-6 text-center">
                       <div className="flex items-center justify-center gap-4 mb-4">
                         <RadialProgressClock 
                           progress={progressPercent} 
                           size={80} 
                           color="gold"
                         />
                         <div className="text-left">
                           <p className="text-xs text-muted-foreground uppercase tracking-wide">
                             Submission Window
                           </p>
                           <p className="text-2xl font-mono font-bold text-[#FFD700]">
                             {Math.floor(secondsRemaining / 3600)}h {Math.floor((secondsRemaining % 3600) / 60)}m
                           </p>
                         </div>
                       </div>
                       <p className="text-sm text-muted-foreground">
                         Complete the mission in the other tab, then return here to submit proof.
                       </p>
                     </CardContent>
                   </Card>
 
                   {/* Mission Accomplished Button */}
                   <Button 
                     onClick={handleMissionComplete}
                     className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-lg hover:from-emerald-600 hover:to-teal-700"
                   >
                     <CheckCircle2 className="h-5 w-5 mr-2" />
                     Mission Accomplished - Submit Proof
                   </Button>
                 </motion.div>
               )}
 
               {state === 'submission' && (
                 <motion.div
                   key="submission"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="space-y-6"
                 >
                   {/* Proof Type Selector */}
                   <div>
                     <Label className="text-sm font-medium mb-3 block">Select Proof Type</Label>
                     <Tabs 
                       value={proofType} 
                       onValueChange={(v) => setProofType(v as typeof proofType)}
                       className="w-full"
                     >
                       <TabsList className="grid grid-cols-3 w-full bg-muted/30">
                         <TabsTrigger value="screenshot" className="gap-2">
                           <Camera className="h-4 w-4" />
                           <span className="hidden sm:inline">Screenshot</span>
                         </TabsTrigger>
                         <TabsTrigger value="video" className="gap-2">
                           <Video className="h-4 w-4" />
                           <span className="hidden sm:inline">Video</span>
                         </TabsTrigger>
                         <TabsTrigger value="link" className="gap-2">
                           <LinkIcon className="h-4 w-4" />
                           <span className="hidden sm:inline">URL</span>
                         </TabsTrigger>
                       </TabsList>
 
                       <TabsContent value="screenshot" className="mt-4">
                         <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-[#FFD700]/50 transition-colors">
                           <Input
                             id="proof-screenshot"
                             type="file"
                             accept="image/*"
                             onChange={handleFileChange}
                             className="hidden"
                           />
                           <label
                             htmlFor="proof-screenshot"
                             className="cursor-pointer flex flex-col items-center gap-3"
                           >
                             {proofFile ? (
                               <>
                                 <FileCheck className="h-12 w-12 text-emerald-500" />
                                 <span className="font-medium text-foreground">{proofFile.name}</span>
                                 <span className="text-xs text-muted-foreground">Click to change</span>
                               </>
                             ) : (
                               <>
                                 <Camera className="h-12 w-12 text-muted-foreground" />
                                 <span className="text-muted-foreground">Click to upload screenshot</span>
                                 <span className="text-xs text-muted-foreground">Max 5MB, JPG/PNG</span>
                               </>
                             )}
                           </label>
                         </div>
                       </TabsContent>
 
                       <TabsContent value="video" className="mt-4">
                         <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-[#FFD700]/50 transition-colors">
                           <Input
                             id="proof-video"
                             type="file"
                             accept="video/*"
                             onChange={handleFileChange}
                             className="hidden"
                           />
                           <label
                             htmlFor="proof-video"
                             className="cursor-pointer flex flex-col items-center gap-3"
                           >
                             {proofFile ? (
                               <>
                                 <FileCheck className="h-12 w-12 text-emerald-500" />
                                 <span className="font-medium text-foreground">{proofFile.name}</span>
                                 <span className="text-xs text-muted-foreground">Click to change</span>
                               </>
                             ) : (
                               <>
                                 <Video className="h-12 w-12 text-muted-foreground" />
                                 <span className="text-muted-foreground">Click to upload video</span>
                                 <span className="text-xs text-muted-foreground">Max 10MB, MP4/MOV</span>
                               </>
                             )}
                           </label>
                         </div>
                       </TabsContent>
 
                       <TabsContent value="link" className="mt-4 space-y-2">
                         <Label htmlFor="proof-link">Proof URL</Label>
                         <Input
                           id="proof-link"
                           type="url"
                           placeholder="https://..."
                           value={proofLink}
                           onChange={(e) => setProofLink(e.target.value)}
                           className="h-12"
                         />
                         <p className="text-xs text-muted-foreground">
                           Paste the URL that proves you completed the task
                         </p>
                       </TabsContent>
                     </Tabs>
                   </div>
 
                   {/* Admin Only Notice */}
                   <Card className="bg-amber-500/10 border-amber-500/30">
                     <CardContent className="p-3 flex items-start gap-2">
                       <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                       <p className="text-xs text-muted-foreground">
                         Your proof will be reviewed by our admin team within 48 hours. 
                         Proofs are stored securely and visible only to administrators.
                       </p>
                     </CardContent>
                   </Card>
 
                   {/* Submit Button */}
                   <Button 
                     onClick={handleSubmit}
                     disabled={!isValid || submitTask.isPending}
                     className="w-full h-14 bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-bold text-lg hover:from-amber-400 hover:to-amber-600 disabled:opacity-50"
                   >
                     {submitTask.isPending ? (
                       <>
                         <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                         Submitting...
                       </>
                     ) : (
                       <>
                         <Upload className="h-5 w-5 mr-2" />
                         Submit for Review
                       </>
                     )}
                   </Button>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
         </motion.div>
       </DialogContent>
     </Dialog>
   );
 }