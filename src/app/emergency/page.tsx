
'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MapPin, Info, ShieldCheck, LocateFixed } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { SOSButton } from '@/components/sos-button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Contact = {
  id: number;
  name: string;
  phone: string;
};

type Coordinates = {
    latitude: number;
    longitude: number;
} | null;


export default function EmergencyPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const [primaryContact, setPrimaryContact] = useState<Contact | null>(null);
    const [alertSent, setAlertSent] = useState(false);
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);
    const [location, setLocation] = useState<Coordinates>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

     useEffect(() => {
        if (isLocationEnabled) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                        setLocationError(null);
                    },
                    (error) => {
                        setLocationError(`Location Error: ${error.message}`);
                    }
                );
            } else {
                setLocationError("Geolocation is not supported by this browser.");
            }
        } else {
            setLocation(null);
            setLocationError("Location sharing is disabled.");
        }
    }, [isLocationEnabled]);

    useEffect(() => {
        try {
            const storedContacts = localStorage.getItem('emergencyContacts');
            if (storedContacts) {
                const contacts: Contact[] = JSON.parse(storedContacts);
                if (contacts.length > 0) {
                    setPrimaryContact(contacts[0]);
                }
            }
        } catch (error) {
            console.error("Could not access localStorage or parse contacts", error);
        }
    }, []);

    const handleSosActivate = () => {
        setAlertSent(true);
        if (primaryContact) {
            // Initiate phone call
            alert(`Initiating call to ${primaryContact.name}...`);
            window.location.href = `tel:91${primaryContact.phone}`;

            // Share location via WhatsApp
            if (location) {
                const whatsappMessage = `Emergency! I need help. This is my current location.`;
                const whatsappUrl = `https://wa.me/91${primaryContact.phone}?text=${encodeURIComponent(whatsappMessage)}%0Ahttps://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
                alert(`Preparing to share location with ${primaryContact.name} via WhatsApp.`);
                window.open(whatsappUrl, '_blank');
            } else {
                 alert("Could not get your location to share.");
            }

        } else {
             alert(`Sharing live location with emergency services.`);
        }
    }

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
                {alertSent ? (
                     <div className="text-center">
                        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-foreground">Alerts Sent</h2>
                        <p className="text-muted-foreground mt-2">
                            Your location has been shared and emergency contacts have been notified.
                        </p>
                        <Button onClick={() => setAlertSent(false)} className="mt-6">Done</Button>
                    </div>
                ) : (
                    <>
                        <SOSButton onActivate={handleSosActivate} />
                        <p className="text-muted-foreground mt-6">
                            Press and hold for 3 seconds to activate emergency alert
                        </p>
                    </>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <LocateFixed className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl">Location Sharing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-center justify-between'>
                            <Label htmlFor="location-switch" className='text-muted-foreground'>
                                Enable for emergencies
                            </Label>
                            <Switch id="location-switch" checked={isLocationEnabled} onCheckedChange={setIsLocationEnabled} />
                        </div>
                        {locationError && <p className="text-xs text-destructive mt-2">{locationError}</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <Phone className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl">Quick Call</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {primaryContact ? (
                            <a href={`tel:${primaryContact.phone}`}>
                                <Button className="w-full">Call {primaryContact.name}</Button>
                            </a>
                        ) : (
                            <Button className="w-full" disabled>Add a contact first</Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <Info className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl">Safety Tips</CardTitle>
                </Header>
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
