-- Create function to update timestamps (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create system_settings table to store configurable platform settings
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage all settings"
ON public.system_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view settings (needed for payment methods display)
CREATE POLICY "Anyone can view settings"
ON public.system_settings
FOR SELECT
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment methods
INSERT INTO public.system_settings (key, value, description) VALUES
(
  'payment_methods',
  '[
    {"id": "gcash", "name": "GCash", "number": "09171234567", "accountName": "Amabilia Network", "qrCodeUrl": null},
    {"id": "bpi", "name": "BPI", "number": "1234567890", "accountName": "Amabilia Network Inc.", "qrCodeUrl": null},
    {"id": "bdo", "name": "BDO", "number": "0987654321", "accountName": "Amabilia Network Inc.", "qrCodeUrl": null}
  ]'::jsonb,
  'Payment methods for membership registration'
);

-- Create storage bucket for QR code images
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to QR codes
CREATE POLICY "QR codes are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'qr-codes');

-- Only admins can upload QR codes
CREATE POLICY "Admins can upload QR codes"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'qr-codes' AND has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update QR codes
CREATE POLICY "Admins can update QR codes"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'qr-codes' AND has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete QR codes
CREATE POLICY "Admins can delete QR codes"
ON storage.objects
FOR DELETE
USING (bucket_id = 'qr-codes' AND has_role(auth.uid(), 'admin'::app_role));