-- Create media-assets storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-assets',
  'media-assets',
  true,
  52428800, -- 50MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Anyone can view media assets (public bucket)
CREATE POLICY "Public can view media assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-assets');

-- RLS: Only admins can upload/manage media assets
CREATE POLICY "Admins can upload media assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update media assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete media assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'media-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Initialize hero_video_settings in system_settings
INSERT INTO system_settings (key, value, description)
VALUES (
  'hero_video_settings',
  '{"source_type": "none", "video_url": null, "storage_path": null, "enabled": false}'::jsonb,
  'Hero section video configuration: source_type (none|upload|url), video_url for external embeds, storage_path for uploaded files'
)
ON CONFLICT (key) DO NOTHING;