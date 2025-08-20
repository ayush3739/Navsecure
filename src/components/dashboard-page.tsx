
'use client';

import { useState } from 'react';
import type { SafetyScoreResult } from '@/lib/types';
import {
  Shield,
  MapPin,
  Hospital,
  ShieldCheck,
  HeartHandshake,
  Phone,
  MessageCircleWarning,
  Info,
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

import { RoutePlanner } from './route-planner';
import { MapView } from './map-view';

const AppHeader = () => (
  <div className="flex items-center gap-3">
    <Shield className="w-8 h-8 text-primary" />
    <h1 className="text-2xl font-bold text-foreground">SafeRoute</h1>
  </div>
);

const SafetyScoreCard = ({ result }: { result: SafetyScoreResult }) => {
  if (!result || !Array.isArray(result.allRoutes) || result.allRoutes.length === 0 || typeof result.safestRouteIndex !== 'number') {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score > 75) return 'bg-green-500';
    if (score > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const safestRoute = result.allRoutes[result.safestRouteIndex];
  if (!safestRoute) return null;

  const alternativeRoutes = result.allRoutes
    .map((route, index) => ({ ...route, originalIndex: index }))
    .filter((_, index) => index !== result.safestRouteIndex);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Safety Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Safest Route</h3>
          <div className="flex items-center justify-between">
            <span className="font-medium">Safety Score</span>
            <span className="text-2xl font-bold text-primary">{safestRoute.safetyScore}/100</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-4 mt-2">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${getScoreColor(safestRoute.safetyScore)}`}
              style={{ width: `${safestRoute.safetyScore}%` }}
            />
          </div>
          <h4 className="font-semibold mt-4 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Key Highlights:
          </h4>
          <div className="flex flex-wrap gap-2">
            {safestRoute.highlights.map((highlight, index) => (
              <Badge key={index} variant="secondary">{highlight}</Badge>
            ))}
          </div>
        </div>

        {alternativeRoutes.length > 0 && <Separator />}

        {alternativeRoutes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Alternative Routes</h3>
            <ul className="space-y-3">
              {alternativeRoutes.map((route) => (
                <li key={route.originalIndex}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Route {route.originalIndex + 1}</span>
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

const SafeSpotsList = () => {
  const safeSpots = [
    { name: 'City General Hospital', type: 'Hospital', icon: Hospital },
    { name: 'Downtown Police Dept.', type: 'Police', icon: ShieldCheck },
    { name: 'Community Center', type: 'Shelter', icon: HeartHandshake },
  ];
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

const EmergencyContacts = () => {
  const contacts = [
    { name: 'Jane Doe', relation: 'Sister' },
    { name: 'John Smith', relation: 'Friend' },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Emergency Contacts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {contacts.map((contact) => (
            <li key={contact.name} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.relation}</p>
              </div>
              <Button size="sm" variant="secondary">Call</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [safetyResult, setSafetyResult] = useState<SafetyScoreResult | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground p-4">
          <p className="font-bold">Google Maps API key is missing.</p>
          <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="flex h-dvh bg-background font-body">
        <aside className="w-full max-w-md bg-card border-r border-border flex-shrink-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <AppHeader />
              <Separator />
              <RoutePlanner onScoreGenerated={setSafetyResult} />
              {safetyResult && <SafetyScoreCard result={safetyResult} />}
              <SafeSpotsList />
              <EmergencyContacts />
            </div>
          </ScrollArea>
        </aside>
        <main className="flex-1 relative">
          <MapView route={safetyResult ? { from: safetyResult.from!, to: safetyResult.to!, safestRouteIndex: safetyResult.safestRouteIndex, allRoutes: safetyResult.allRoutes } : null} />
          <div className="absolute top-4 right-4 flex gap-2">
            <Sheet>
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
                </Header>
                <div className="py-4">
                  {/* Reporting form could go here */}
                  <p className="text-sm text-muted-foreground">Live reporting form coming soon.</p>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="destructive" className="font-bold shadow-lg animate-pulse">
              SOS
            </Button>
          </div>
        </main>
      </div>
    </APIProvider>
  );
}
