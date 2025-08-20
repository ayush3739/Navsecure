
'use client';

import { useEffect, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Search, Loader2, LocateFixed } from 'lucide-react';
import { getSafetyScoreAction } from '@/app/actions';
import type { ActionState, SafetyScoreResult } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlaceAutocomplete } from './place-autocomplete';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

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
  const [fromValue, setFromValue] = useState('');
  
  const initialState: ActionState = null;
  const [state, formAction] = useActionState(getSafetyScoreAction, initialState);

  const geocoding = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();

  useEffect(() => {
    if (geocoding) {
      setGeocoder(new geocoding.Geocoder());
    }
  }, [geocoding]);

  useEffect(() => {
    if (state?.result) {
      onScoreGenerated(state.result as SafetyScoreResult);
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

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          if (geocoder) {
            geocoder.geocode({ location: pos }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                setFromValue(results[0].formatted_address);
              } else {
                toast({ variant: 'destructive', description: 'Could not find address for your location.' });
              }
            });
          }
        },
        () => {
          toast({ variant: 'destructive', description: "The Geolocation service failed."});
        }
      );
    } else {
      toast({ variant: 'destructive', description: "Your browser doesn't support geolocation."});
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Your Route</CardTitle>
        <CardDescription>Enter your start and end points to get an AI-powered safety analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="relative">
            <PlaceAutocomplete 
              name="from" 
              placeholder="From: e.g., '123 Main St, Anytown'" 
              error={state?.fieldErrors?.from?.[0]}
              value={fromValue}
              onValueChange={setFromValue}
            />
            <Button variant="ghost" size="icon" type="button" onClick={handleUseCurrentLocation} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                <LocateFixed className="h-4 w-4" />
            </Button>
          </div>
          <PlaceAutocomplete name="to" placeholder="To: e.g., 'City Park'" error={state?.fieldErrors?.to?.[0]} />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
