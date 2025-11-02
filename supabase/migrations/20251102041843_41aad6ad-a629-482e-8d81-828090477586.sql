-- Create table for email collection
CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert their email
CREATE POLICY "Anyone can subscribe with their email" 
ON public.email_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Create policy to prevent reading emails (privacy)
CREATE POLICY "No one can read emails" 
ON public.email_subscribers 
FOR SELECT 
USING (false);

-- Create index for better performance
CREATE INDEX idx_email_subscribers_email ON public.email_subscribers(email);