
'use client';

import { MainLayout } from '@/components/main-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { IncidentReportForm } from '@/components/incident-report-form';
import { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

type Report = {
  id: string;
  location: string;
  reason: string;
  description: string;
  date: string;
  status: 'Received' | 'In Review' | 'Resolved';
};

const mockReports: Report[] = [
    {
        id: 'REP-001',
        location: 'Connaught Place, New Delhi',
        reason: 'Poor street lighting',
        description: 'The streetlights on the inner circle are mostly off.',
        date: '2024-07-28',
        status: 'Resolved',
    },
    {
        id: 'REP-002',
        location: 'Hauz Khas Village, New Delhi',
        reason: 'Suspicious activity',
        description: 'A group of people were loitering and causing a nuisance near the lake.',
        date: '2024-07-27',
        status: 'In Review',
    },
    {
        id: 'REP-003',
        location: 'Cyber Hub, Gurugram',
        reason: 'Unsafe gathering',
        description: '',
        date: '2024-07-26',
        status: 'Received',
    },
    {
        id: 'REP-004',
        location: 'Khan Market, New Delhi',
        reason: 'Damaged pavement',
        description: 'The pavement is broken near the main entrance, making it a trip hazard.',
        date: '2024-07-25',
        status: 'Resolved',
    }
];

const getStatusBadgeVariant = (status: Report['status']) => {
  switch (status) {
    case 'Resolved':
      return 'default';
    case 'In Review':
      return 'secondary';
    case 'Received':
      return 'outline';
    default:
      return 'outline';
  }
};


export default function ReportsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <div className="p-6 md:p-8 space-y-6">
            <header className="flex items-center justify-between gap-3">
                <div className='flex items-center gap-3'>
                <FileText className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Incident Reports</h1>
                    <p className="text-muted-foreground">
                    A log of all submitted incidents
                    </p>
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
                    Review the status of all incidents reported by the community.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {mockReports.map((report) => (
                        <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.location}</TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            </div>
            <SheetContent>
                <SheetHeader>
                <SheetTitle>Report an Incident</SheetTitle>
                <SheetDescription>
                    Your report helps us improve safety data for everyone. Describe what you're observing.
                </SheetDescription>
                </SheetHeader>
                <IncidentReportForm onSubmitted={() => setIsSheetOpen(false)} />
            </SheetContent>
        </Sheet>
        </MainLayout>
    </APIProvider>
  );
}
