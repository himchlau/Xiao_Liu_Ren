-- Add restrictive UPDATE policy for email_subscribers
CREATE POLICY "No one can update email subscribers"
ON public.email_subscribers
FOR UPDATE
USING (false);

-- Add restrictive DELETE policy for email_subscribers  
CREATE POLICY "No one can delete email subscribers"
ON public.email_subscribers
FOR DELETE
USING (false);