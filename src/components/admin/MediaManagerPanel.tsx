import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { 
  Video, 
  Upload, 
  Link2, 
  Save, 
  Trash2, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeroVideoSettings {
  source_type: 'none' | 'upload' | 'url';
  video_url: string | null;
  storage_path: string | null;
  enabled: boolean;
}

export function MediaManagerPanel() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [sourceType, setSourceType] = useState<'upload' | 'url'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'hero_video_settings')
        .single();

      if (error) throw error;

      if (data) {
        const settings = data.value as unknown as HeroVideoSettings;
        setSourceType(settings.source_type === 'none' ? 'url' : settings.source_type);
        setVideoUrl(settings.video_url || '');
        setStoragePath(settings.storage_path);
        setIsEnabled(settings.enabled);
        
        if (settings.storage_path) {
          setUploadedFileName(settings.storage_path.split('/').pop() || null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch video settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to load video settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload MP4, WebM, or OGG video files only.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 50MB.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      // Delete old file if exists
      if (storagePath) {
        await supabase.storage.from('media-assets').remove([storagePath]);
      }

      // Upload new file
      const fileName = `hero-video-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      setStoragePath(filePath);
      setUploadedFileName(fileName);
      setSourceType('upload');

      toast({
        title: 'Upload Successful',
        description: 'Video uploaded. Click Save to apply changes.',
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload video file.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const settings = {
        source_type: isEnabled ? sourceType : 'none',
        video_url: sourceType === 'url' ? videoUrl : null,
        storage_path: sourceType === 'upload' ? storagePath : null,
        enabled: isEnabled
      };

      const { error } = await supabase
        .from('system_settings')
        .update({ value: settings as Json, updated_at: new Date().toISOString() })
        .eq('key', 'hero_video_settings');

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Hero video settings updated successfully.',
      });
    } catch (err: any) {
      console.error('Save failed:', err);
      toast({
        title: 'Save Failed',
        description: err.message || 'Failed to save video settings.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveVideo = async () => {
    setIsSaving(true);

    try {
      // Delete from storage if uploaded
      if (storagePath) {
        await supabase.storage.from('media-assets').remove([storagePath]);
      }

      const settings = {
        source_type: 'none',
        video_url: null,
        storage_path: null,
        enabled: false
      };

      const { error } = await supabase
        .from('system_settings')
        .update({ value: settings as Json, updated_at: new Date().toISOString() })
        .eq('key', 'hero_video_settings');

      if (error) throw error;

      setVideoUrl('');
      setStoragePath(null);
      setUploadedFileName(null);
      setIsEnabled(false);

      toast({
        title: 'Video Removed',
        description: 'Hero video has been removed from the landing page.',
      });
    } catch (err: any) {
      console.error('Remove failed:', err);
      toast({
        title: 'Remove Failed',
        description: err.message || 'Failed to remove video.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-mono">
            <Video className="h-5 w-5 text-primary" />
            Hero Video Settings
          </CardTitle>
          <CardDescription>
            Configure the video displayed in the Hero section of the landing page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="space-y-0.5">
              <Label className="text-foreground font-medium">Enable Hero Video</Label>
              <p className="text-sm text-muted-foreground">
                Show video in the landing page hero section
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          {/* Source Type Selection */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Video Source</Label>
            <RadioGroup
              value={sourceType}
              onValueChange={(value) => setSourceType(value as 'upload' | 'url')}
              className="grid grid-cols-2 gap-4"
            >
              <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                sourceType === 'upload' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-primary/10 hover:border-primary/30'
              }`}>
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload" className="flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  File Upload
                </Label>
              </div>
              <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                sourceType === 'url' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-primary/10 hover:border-primary/30'
              }`}>
                <RadioGroupItem value="url" id="url" />
                <Label htmlFor="url" className="flex items-center gap-2 cursor-pointer">
                  <Link2 className="h-4 w-4" />
                  URL / Embed
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Upload Section */}
          {sourceType === 'upload' && (
            <div className="space-y-3">
              <Label className="text-muted-foreground">Upload Video File</Label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-primary/20"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>
                {uploadedFileName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {uploadedFileName}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: MP4, WebM, OGG. Max size: 50MB.
              </p>
            </div>
          )}

          {/* URL Section */}
          {sourceType === 'url' && (
            <div className="space-y-3">
              <Label htmlFor="video-url" className="text-muted-foreground">
                Video URL or Embed Link
              </Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-background border-primary/10 focus:border-primary/30"
              />
              <p className="text-xs text-muted-foreground">
                Supports: YouTube, Vimeo, Facebook, or direct video file URLs.
              </p>
            </div>
          )}

          {/* Preview Status */}
          {isEnabled && (sourceType === 'upload' ? storagePath : videoUrl) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-400">
                Video configured and ready to display
              </span>
            </div>
          )}

          {isEnabled && !(sourceType === 'upload' ? storagePath : videoUrl) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-400">
                Please {sourceType === 'upload' ? 'upload a video file' : 'enter a video URL'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveVideo}
              disabled={isSaving || (!storagePath && !videoUrl)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
