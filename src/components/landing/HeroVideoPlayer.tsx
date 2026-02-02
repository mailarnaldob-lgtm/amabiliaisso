import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeroVideoSettings {
  source_type: 'none' | 'upload' | 'url';
  video_url: string | null;
  storage_path: string | null;
  enabled: boolean;
}

export function HeroVideoPlayer() {
  const [settings, setSettings] = useState<HeroVideoSettings | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVideoSettings();
  }, []);

  const fetchVideoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'hero_video_settings')
        .single();

      if (error || !data) {
        setIsLoading(false);
        return;
      }

      const videoSettings = data.value as unknown as HeroVideoSettings;
      setSettings(videoSettings);

      if (videoSettings.enabled && videoSettings.source_type !== 'none') {
        if (videoSettings.source_type === 'upload' && videoSettings.storage_path) {
          // Get public URL from storage
          const { data: urlData } = supabase.storage
            .from('media-assets')
            .getPublicUrl(videoSettings.storage_path);
          setVideoSrc(urlData.publicUrl);
        } else if (videoSettings.source_type === 'url' && videoSettings.video_url) {
          setVideoSrc(videoSettings.video_url);
        }
      }
    } catch (err) {
      console.error('Failed to fetch video settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if it's a YouTube or Facebook embed URL
  const isEmbedUrl = (url: string): boolean => {
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('facebook.com') ||
           url.includes('vimeo.com');
  };

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string): string => {
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  // Placeholder when no video is set
  if (isLoading) {
    return (
      <motion.div
        className="relative w-full aspect-video rounded-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, hsl(220 23% 8%) 0%, hsl(220 23% 5%) 100%)',
          border: '1px solid hsl(45 100% 51% / 0.2)',
          boxShadow: '0 0 40px hsl(45 100% 51% / 0.1)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (!settings?.enabled || !videoSrc) {
    return (
      <motion.div
        className="relative w-full aspect-video rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 50%, hsl(45 100% 51% / 0.05) 100%)',
          border: '1px solid hsl(45 100% 51% / 0.25)',
          boxShadow: '0 0 60px hsl(45 100% 51% / 0.15), inset 0 1px 0 hsl(45 100% 51% / 0.1)'
        }}
        whileHover={{
          boxShadow: '0 0 80px hsl(45 100% 51% / 0.25), inset 0 1px 0 hsl(45 100% 51% / 0.2)',
          borderColor: 'hsl(45 100% 51% / 0.4)'
        }}
      >
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(hsl(45 100% 51% / 0.5) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(45 100% 51% / 0.5) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, hsl(45 100% 51% / 0.15) 0%, transparent 70%)',
              border: '2px solid hsl(45 100% 51% / 0.3)'
            }}
            animate={{
              boxShadow: [
                '0 0 20px hsl(45 100% 51% / 0.2)',
                '0 0 40px hsl(45 100% 51% / 0.3)',
                '0 0 20px hsl(45 100% 51% / 0.2)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Play className="w-8 h-8 text-amber-400/70 ml-1" />
          </motion.div>
          
          <div className="text-center">
            <p className="text-amber-400/80 font-semibold text-sm tracking-wider uppercase">
              Your Sovereign Video Here
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Configured by Admin
            </p>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-400/30 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-400/30 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-400/30 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-400/30 rounded-br-xl" />
      </motion.div>
    );
  }

  // Render video based on source type
  if (settings.source_type === 'url' && isEmbedUrl(videoSrc)) {
    return (
      <motion.div
        className="relative w-full aspect-video rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          border: '1px solid hsl(45 100% 51% / 0.25)',
          boxShadow: '0 0 60px hsl(45 100% 51% / 0.15)'
        }}
      >
        <iframe
          src={getEmbedUrl(videoSrc)}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Hero Video"
        />
      </motion.div>
    );
  }

  // Direct video file (uploaded or direct URL)
  return (
    <motion.div
      className="relative w-full aspect-video rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{
        border: '1px solid hsl(45 100% 51% / 0.25)',
        boxShadow: '0 0 60px hsl(45 100% 51% / 0.15)'
      }}
    >
      <video
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover"
        controls
        playsInline
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </motion.div>
  );
}
