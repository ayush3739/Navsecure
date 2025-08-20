
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Search, Loader2 } from 'lucide-react';
import { getSafetyScoreAction } from '@/app/actions';
import type { ActionState, SafetyScoreResult } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlaceAutocomplete } from './place-autocomplete';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Find Safest Route
        </>
      )}
    </Button>
  );
}

type RoutePlannerProps = {
  onScoreGenerated: (result: SafetyScoreResult | null) => void;
};

export function RoutePlanner({ onScoreGenerated }: RoutePlannerProps) {
  const { toast } = useToast();
  
  const initialState: ActionState = null;
  const [state, formAction] = useActionState(getSafetyScoreAction, initialState);

  useEffect(() => {
    if (state?.result) {
      onScoreGenerated(state.result);
    }
    if (state?.error) {
      onScoreGenerated(null);
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state, onScoreGenerated, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Your Route</CardTitle>
        <CardDescription>Enter your start and end points to get an AI-powered safety analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <PlaceAutocomplete name="from" placeholder="From: e.g., '123 Main St, Anytown'" error={state?.fieldErrors?.from?.[0]} />
          <PlaceAutocomplete name="to" placeholder="To: e.g., 'City Park'" error={state?.fieldErrors?.to?.[0]} />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
