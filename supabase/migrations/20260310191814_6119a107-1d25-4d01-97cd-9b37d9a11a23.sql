ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

UPDATE public.bids SET updated_by = user_id WHERE updated_by IS NULL;