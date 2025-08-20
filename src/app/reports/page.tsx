
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { IncidentReportForm } from '@/components/incident-report-form';
import { APIProvider } from '@vis.gl/react-google-maps';

type Report = {
  id: string;
  date: string;
  location: string;
  reason: string;
  status: 'Received' | 'In Review' | 'Resolved';
};

type Contact = {
  id: number;
  name: string;
  phone: string;
};

type Coordinates = {
    latitude: number;
    longitude: number;
} | null;


const mockReports: Report[] = [
  { id: 'REP-001', date: '2023-10-26', location: 'Main Street Park', reason: 'Poor street lighting', status: 'Resolved' },
  { id: 'REP-002', date: '2023-10-24', location: 'Elm St & 2nd Ave', reason: 'Suspicious activity', status: 'In Review' },
  { id: 'REP-003', date: '2023-10-22', location: 'City Center Plaza', reason: 'Damaged pavement', status: 'Resolved' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [primaryContact, setPrimaryContact] = useState<Contact | null>(null);
  const [location, setLocation] = useState<Coordinates>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
  }, []);

  const handleSosActivate = () => {
        if (primaryContact) {
            alert(`Initiating call to ${primaryContact.name}...`);
            window.location.href = `tel:91${primaryContact.phone}`;

            if (location) {
                const whatsappMessage = `Emergency! I need help. This is my current location.`;
                const whatsappUrl = `https://wa.me/91${primaryContact.phone}?text=${encodeURIComponent(whatsappMessage)}%0Ahttps://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
                alert(`Preparing to share location with ${primaryContact.name} via WhatsApp.`);
                window.open(whatsappUrl, '_blank');
            } else {
                 alert(`Could not get your location to share. ${locationError || ''}`);
            }
        } else {
             alert(`Sharing live location with emergency services.`);
        }
    };

  const handleReportSubmitted = (data: { location: string; reason: string; description: string }) => {
    const newReport: Report = {
      id: `REP-${String(reports.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      location: data.location,
      reason: data.reason,
      status: 'Received',
    };
    setReports([newReport, ...reports]);
    setIsSheetOpen(false);
  };
  
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
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <MainLayout onSosActivate={handleSosActivate}>
                <div className="p-6 md:p-8 space-y-6">
                <header className="flex items-center justify-between">
                    <div className='flex items-center gap-3'>
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                        <h1 className="text-2xl font-bold text-foreground">My Reports</h1>
                        <p className="text-muted-foreground">Track your submitted incidents</p>
                        </div>
                    </div>
                     <SheetTrigger asChild>
                        <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Report
                        </Button>
                    </SheetTrigger>
                </header>

                <Card>
                    <CardHeader>
                    <CardTitle>Submitted Reports</CardTitle>
                    <CardDescription>
                        Here is a list of all the incidents you have reported.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Report ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.id}</TableCell>
                            <TableCell>{report.date}</TableCell>
                            <TableCell>{report.location}</TableCell>
                            <TableCell>{report.reason}</TableCell>
                            <TableCell className="text-right">
                                <Badge
                                variant={
                                    report.status === 'Resolved' ? 'default' :
                                    report.status === 'In Review' ? 'secondary' :
                                    'destructive'
                                }
                                className={
                                    report.status === 'Resolved' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                                    report.status === 'In Review' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                                    ''
                                }
                                >
                                {report.status}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
                </div>
            </MainLayout>
            <SheetContent>
                <SheetHeader>
                <SheetTitle>Report an Incident</SheetTitle>
                <SheetDescription>
                    Your report helps us improve safety data for everyone. Describe what you're observing.
                </SheetDescription>
                </SheetHeader>
                <IncidentReportForm onSubmitted={handleReportSubmitted} />
            </SheetContent>
        </Sheet>
    </APIProvider>
  );
}
