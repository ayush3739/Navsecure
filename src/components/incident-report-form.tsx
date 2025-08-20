
'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitIncidentReportAction } from '@/app/actions';
import type { ActionState } from '@/lib/types';
import { PlaceAutocomplete } from '@/components/place-autocomplete';
import React from 'react';

function IncidentSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Submit Report
        </>
      )}
    </Button>
  );
}

type IncidentReportFormProps = {
  onSubmitted: (data: { location: string; reason: string; description: string; }) => void;
};


export const IncidentReportForm = ({onSubmitted}: IncidentReportFormProps) => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialState: ActionState = null;
  const [state, formAction] = useActionState(submitIncidentReportAction, initialState);

  React.useEffect(() => {
    if (state?.result?.confirmation) {
      toast({
        title: "Report Submitted",
        description: state.result.confirmation.message,
      });

      if (formRef.current) {
        const formData = new FormData(formRef.current);
        const location = formData.get('location') as string;
        const reason = formData.get('reason') as string;
        const description = formData.get('description') as string;
        onSubmitted({ location, reason, description });
        formRef.current.reset();
      }
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state, toast, onSubmitted]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 py-4">
       <div>
         <PlaceAutocomplete name="location" placeholder="Enter location of incident" error={state?.fieldErrors?.location?.[0]} />
       </div>
       <div>
        <Select name="reason" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Poor street lighting">Poor street lighting</SelectItem>
            <SelectItem value="Suspicious activity">Suspicious activity</SelectItem>
            <SelectItem value="Damaged pavement">Damaged pavement</SelectItem>
            <SelectItem value="Unsafe gathering">Unsafe gathering</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {state?.fieldErrors?.reason && <p className="text-sm text-destructive mt-1">{state.fieldErrors.reason[0]}</p>}
       </div>
      <Textarea name="description" placeholder="Provide a brief description (optional)" />
      <IncidentSubmitButton />
    </form>
  )
}
