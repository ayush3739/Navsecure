
'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MapPin, Info } from 'lucide-react';
import React, { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { SOSButton } from '@/components/sos-button';


export default function EmergencyPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const [primaryContact, setPrimaryContact] = useState({ name: 'Jane Doe', phone: '9876543210' });

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
                    <a href={`tel:${primaryContact.phone}`}>
                        <Button className="w-full">Call {primaryContact.name}</Button>
                    </a>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <MapPin className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Share Location</CardTitle>
                </CardHeader>
                <CardContent>
                <Button className="w-full" onClick={() => alert('Live location sent to your contacts!')}>Send Live Location</Button>
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
