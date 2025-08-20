'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Search, Loader2 } from 'lucide-react';
import { getSafetyScoreAction } from '@/app/actions';
import type { ActionState, SafetyScoreResult } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialState: ActionState = null;
  const [state, formAction] = useFormState(getSafetyScoreAction, initialState);

  useEffect(() => {
    if (state?.result) {
      onScoreGenerated(state.result);
      formRef.current?.reset();
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
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Input name="from" placeholder="From: e.g., '123 Main St, Anytown'" required />
            {state?.fieldErrors?.from && <p className="text-sm text-destructive">{state.fieldErrors.from[0]}</p>}
          </div>
          <div className="space-y-2">
            <Input name="to" placeholder="To: e.g., 'City Park'" required />
            {state?.fieldErrors?.to && <p className="text-sm text-destructive">{state.fieldErrors.to[0]}</p>}
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
