'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Search, Loader2 } from 'lucide-react';
import { getSafetyScoreAction } from '@/app/actions';
import type { ActionState, SafetyScoreResult } from '@/lib/types';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

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

const AutocompletePortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
};

const PlaceAutocomplete = ({ name, placeholder, error }: { name: string, placeholder: string, error?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const [pacContainer, setPacContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;
    
    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
    });
    
    // The default pac-container is not available until the user types
    // so we can't reliably style it. We create our own and pass it to the autocomplete instance.
    const customPacContainer = document.createElement('div');
    autocomplete.set('pac-container', customPacContainer);
    
    setPacContainer(customPacContainer);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (inputRef.current && place.formatted_address) {
        inputRef.current.value = place.formatted_address;
      }
    });

    return () => {
      // Clean up the container when the component unmounts
      if (pacContainer?.parentElement) {
        pacContainer.parentElement.removeChild(pacContainer);
      }
    };

  }, [places]);

  return (
    <div className="space-y-2">
      <Input ref={inputRef} name={name} placeholder={placeholder} required />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {pacContainer && (
        <AutocompletePortal>
          <div ref={(node) => {
            if (node && pacContainer) {
              node.appendChild(pacContainer);
            }
          }}
          className={cn(
              "pac-container-wrapper z-[9999] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            )}
           />
        </AutocompletePortal>
      )}
    </div>
  );
};

type RoutePlannerProps = {
  onScoreGenerated: (result: SafetyScoreResult | null) => void;
};

export function RoutePlanner({ onScoreGenerated }: RoutePlannerProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialState: ActionState = null;
  const [state, formAction] = useActionState(getSafetyScoreAction, initialState);

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
          <PlaceAutocomplete name="from" placeholder="From: e.g., '123 Main St, Anytown'" error={state?.fieldErrors?.from?.[0]} />
          <PlaceAutocomplete name="to" placeholder="To: e.g., 'City Park'" error={state?.fieldErrors?.to?.[0]} />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
