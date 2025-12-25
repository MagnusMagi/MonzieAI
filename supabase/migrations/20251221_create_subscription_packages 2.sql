-- Create subscription_packages table
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_key TEXT UNIQUE NOT NULL, -- 'weekly', 'monthly', '3_month', '6_month', 'yearly'
  display_name TEXT NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  credits INTEGER NOT NULL,
  duration_days INTEGER NOT NULL, -- 7, 30, 90, 180, 365
  revenuecat_product_id TEXT, -- RevenueCat product identifier
  revenuecat_package_id TEXT, -- RevenueCat package identifier
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscription_packages_key ON public.subscription_packages(package_key);
CREATE INDEX IF NOT EXISTS idx_subscription_packages_active ON public.subscription_packages(is_active);

-- Enable RLS
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- Create policies - Everyone can read active packages
CREATE POLICY "Anyone can read active packages"
  ON public.subscription_packages
  FOR SELECT
  USING (is_active = true);

-- Insert package data based on the image specifications
INSERT INTO public.subscription_packages (package_key, display_name, price_usd, credits, duration_days, display_order) VALUES
  ('weekly', 'Weekly', 6.99, 40, 7, 1),
  ('monthly', 'Monthly', 19.99, 180, 30, 2),
  ('3_month', '3-Month', 44.99, 500, 90, 3),
  ('6_month', '6-Month', 74.99, 1000, 180, 4),
  ('yearly', 'Yearly', 119.99, 2500, 365, 5)
ON CONFLICT (package_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price_usd = EXCLUDED.price_usd,
  credits = EXCLUDED.credits,
  duration_days = EXCLUDED.duration_days,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_subscription_packages_updated_at
  BEFORE UPDATE ON public.subscription_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_packages_updated_at();

