
'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import type { ActionState, SafetyScoreResult } from '@/lib/types';
import {
  Shield,
  MapPin,
  Hospital,
  ShieldCheck,
  HeartHandshake,
  MessageCircleWarning,
  Info,
  Loader2,
  Send,
  PanelLeft,
  Menu,
  Compass,
  FileText,
  Phone,
  User,
  AlertTriangle,
} from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';
import { submitIncidentReportAction } from '@/app/actions';

import { RoutePlanner } from '@/components/route-planner';
import { MapView } from '@/components/map-view';
import React from 'react';
import { cn } from '@/lib/utils';
import { SOSButton } from '@/components/sos-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { PlaceAutocomplete } from '@/components/place-autocomplete';


const SafetyScoreCard = ({ result }: { result: SafetyScoreResult }) => {
  const [selectedRoute, setSelectedRoute] = useState(result.allRoutes[0]);

  useEffect(() => {
    setSelectedRoute(result.allRoutes[0]);
  }, [result]);

  if (!result || !Array.isArray(result.allRoutes) || result.allRoutes.length === 0) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score > 75) return 'bg-green-500';
    if (score > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const displayedRoute = selectedRoute || result.allRoutes[0];
  const alternativeRoutes = result.allRoutes.filter(r => r.originalIndex !== displayedRoute.originalIndex);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Safety Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">{displayedRoute.originalIndex === result.allRoutes[0].originalIndex ? 'Safest Route' : `Alternative ${result.allRoutes.findIndex(r => r.originalIndex === displayedRoute.originalIndex)}`}</h3>
          <div className="flex items-center justify-between">
            <span className="font-medium">Safety Score</span>
            <span className="text-2xl font-bold text-primary">{displayedRoute.safetyScore}/100</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-4 mt-2">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${getScoreColor(displayedRoute.safetyScore)}`}
              style={{ width: `${displayedRoute.safetyScore}%` }}
            />
          </div>
          <h4 className="font-semibold mt-4 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Key Highlights:
          </h4>
          <div className="flex flex-wrap gap-2">
            {displayedRoute.highlights.map((highlight, index) => (
              <Badge key={index} variant="secondary">{highlight}</Badge>
            ))}
          </div>
        </div>

        {alternativeRoutes.length > 0 && <Separator />}

        {alternativeRoutes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Other Routes</h3>
            <ul className="space-y-3">
              {alternativeRoutes.map((route) => (
                <li key={route.originalIndex} onClick={() => setSelectedRoute(route)} className="cursor-pointer">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Alternative {result.allRoutes.findIndex(r => r.originalIndex === route.originalIndex)}</span>
                    <span className="font-bold">{route.safetyScore}/100</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 mt-1">
                    <div
                      className={`h-2.5 rounded-full ${getScoreColor(route.safetyScore)}`}
                      style={{ width: `${route.safetyScore}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SafeSpotsList = ({ result }: { result: SafetyScoreResult | null }) => {
  const safeSpots = [
    { name: 'Lok Nayak Hospital', type: 'Hospital', icon: Hospital },
    { name: 'Connaught Place Police Station', type: 'Police', icon: ShieldCheck },
    { name: 'Govt Girls Senior Secondary School', type: 'Shelter', icon: HeartHandshake },
  ];
  
  if (!result) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Nearby Safe Spots
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {safeSpots.map((spot) => (
            <li key={spot.name} className="flex items-center gap-4">
              <spot.icon className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="font-medium">{spot.name}</p>
                <p className="text-sm text-muted-foreground">{spot.type}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

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

const LiveReportingForm = ({onSubmitted}: {onSubmitted: () => void}) => {
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
      formRef.current?.reset();
      onSubmitted();
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

export default function FindRoutePage() {
  const [safetyResult, setSafetyResult] = useState<SafetyScoreResult | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const menuItems = [
    { href: '/emergency', label: 'Emergency', icon: AlertTriangle },
    { href: '/find-route', label: 'Find Route', icon: Compass },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/contacts', label: 'Emergency Contacts', icon: Phone },
    { href: '/profile', label: 'Profile', icon: User },
  ];


  if (!apiKey) {
      return (
        <div className="w-full h-screen bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground p-4">
            <p className="font-bold">Google Maps API key is missing.</p>
            <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.</p>
          </div>
        </div>
      );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-screen w-screen relative">
        <aside className={cn(
          "absolute top-0 left-0 h-full w-[400px] bg-card border-r border-border z-10 transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                    <RoutePlanner onScoreGenerated={setSafetyResult} />
                    {safetyResult && <SafetyScoreCard result={safetyResult} />}
                    <SafeSpotsList result={safetyResult} />
                </div>
            </ScrollArea>
        </aside>

        <main className="h-full w-full">
          <MapView route={safetyResult ? { from: safetyResult.from!, to: safetyResult.to!, allRoutes: safetyResult.allRoutes } : null} />
        </main>
        
        <div className="absolute top-4 left-4 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <PanelLeft className="mr-2 h-4 w-4" />
                    <span>{isSidebarOpen ? 'Hide' : 'Show'} Controls</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {menuItems.map((item) => (
                   <Link href={item.href} key={item.href}>
                    <DropdownMenuItem>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                    </DropdownMenuItem>
                   </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        <div className="absolute top-4 right-4 z-20">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                  <Button variant="secondary">
                  <MessageCircleWarning className="mr-2 h-4 w-4" />
                  Live Reporting
                  </Button>
              </SheetTrigger>
              <SheetContent>
                  <SheetHeader>
                  <SheetTitle>Report an Incident</SheetTitle>
                  <SheetDescription>
                      Your report helps us improve safety data for everyone. Describe what you're observing.
                  </SheetDescription>
                  </SheetHeader>
                  <LiveReportingForm onSubmitted={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
        </div>

         <div className="absolute bottom-4 right-4 z-20">
            <SOSButton onActivate={() => {}} />
        </div>
      </div>
    </APIProvider>
  );
}
