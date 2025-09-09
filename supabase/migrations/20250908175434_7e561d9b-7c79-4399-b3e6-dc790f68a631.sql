-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  caste_community TEXT,
  occupation TEXT,
  education TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schemes table
CREATE TABLE public.schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  category TEXT,
  eligibility_criteria JSONB,
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved schemes table (many-to-many relationship)
CREATE TABLE public.saved_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scheme_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Schemes policies (public read access)
CREATE POLICY "Anyone can view active schemes" 
ON public.schemes 
FOR SELECT 
USING (is_active = true);

-- Saved schemes policies
CREATE POLICY "Users can view their saved schemes" 
ON public.saved_schemes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save schemes" 
ON public.saved_schemes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their saved schemes" 
ON public.saved_schemes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at
  BEFORE UPDATE ON public.schemes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample schemes for testing
INSERT INTO public.schemes (name, description, deadline, category, source_url) VALUES
('PM Kisan Samman Nidhi', 'Financial assistance of Rs 6000 per year to small and marginal farmers', '2024-12-31', 'Agriculture', 'https://pmkisan.gov.in'),
('Beti Bachao Beti Padhao', 'Scheme to improve child sex ratio and enable education for girls', '2024-11-30', 'Women', 'https://wcd.nic.in/bbbp-scheme'),
('Skill India Mission', 'Skill development programs for youth employment', '2024-10-15', 'Employment', 'https://skillindia.gov.in'),
('Pradhan Mantri Awas Yojana', 'Housing scheme for economically weaker sections', '2024-09-20', 'Housing', 'https://pmaymis.gov.in'),
('National Scholarship Portal', 'Various scholarships for students', '2024-08-31', 'Education', 'https://scholarships.gov.in');