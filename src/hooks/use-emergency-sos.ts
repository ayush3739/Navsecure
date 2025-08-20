
'use client';

import { useState, useEffect } from 'react';

type Contact = {
  id: number;
  name: string;
  phone: string;
};

type Coordinates = {
    latitude: number;
    longitude: number;
} | null;

export function useEmergencySos() {
    const [primaryContact, setPrimaryContact] = useState<Contact | null>(null);
    const [location, setLocation] = useState<Coordinates>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [alertSent, setAlertSent] = useState(false);

    useEffect(() => {
        // Get primary contact from local storage
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

        // Get location
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
                    console.error(`Location Error: ${error.message}`);
                    setLocationError(`Location Error: ${error.message}`);
                }
            );
        } else {
            const errorMsg = "Geolocation is not supported by this browser.";
            console.error(errorMsg);
            setLocationError(errorMsg);
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
                 alert(`Could not get your location to share. ${locationError || 'Unknown error.'}`);
            }

        } else {
             alert(`No primary contact found. Sharing live location with emergency services.`);
        }
    };

    return {
        handleSosActivate,
        alertSent,
        setAlertSent
    };
}
