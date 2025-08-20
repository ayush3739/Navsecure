
'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MapPin, Info } from 'lucide-react';
import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';


const SOSButton = () => {
  const [isPressed, setIsPressed] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
        // In a real app, this would trigger an emergency alert to contacts.
        alert('Emergency Alert Activated!');
        setIsPressed(false);
    }, 3000);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div
      className="relative w-40 h-40 rounded-full flex items-center justify-center cursor-pointer select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse"></div>
      <div className={`absolute inset-0 bg-red-600 rounded-full transition-transform duration-3000 ease-linear ${isPressed ? 'scale-100' : 'scale-0'}`} style={{transformOrigin: 'center'}}></div>
      <div className="relative w-32 h-32 bg-red-700 rounded-full flex items-center justify-center shadow-inner">
        <span className="text-white text-3xl font-bold">SOS</span>
      </div>
    </div>
  );
}

export default function EmergencyPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
        <MainLayout>
        <div className="p-6 md:p-8 space-y-6">
            <header className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
                <h1 className="text-2xl font-bold text-foreground">Emergency Mode</h1>
                <p className="text-muted-foreground">Quick access to safety features</p>
            </div>
            </header>

            <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <SOSButton />
                <p className="text-muted-foreground mt-6">
                    Press and hold for 3 seconds to activate emergency alert
                </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <Phone className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Quick Call</CardTitle>
                </CardHeader>
                <CardContent>
                    <a href="tel:">
                        <Button className="w-full">Call Emergency Contact</Button>
                    </a>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <MapPin className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Share Location</CardTitle>
                </CardHeader>
                <CardContent>
                <Button className="w-full" onClick={() => alert('Live location sent!')}>Send Live Location</Button>
                </CardContent>
            </Card>
            </div>

            <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <Info className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Safety Tips</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Always inform someone about your travel plans</li>
                <li>Keep your phone charged and carry a power bank</li>
                <li>Trust your instincts - if something feels wrong, seek help</li>
                </ul>
            </CardContent>
            </Card>
        </div>
        </MainLayout>
    </APIProvider>
  );
}
