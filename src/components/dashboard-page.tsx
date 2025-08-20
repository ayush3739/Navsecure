
'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import type { ActionState, SafetyScoreResult } from '@/lib/types';
import {
  Shield,
  MapPin,
  Hospital,
  ShieldCheck,
  HeartHandshake,
  Phone,
  MessageCircleWarning,
  Info,
  Loader2,
  Send,
  PlusCircle,
  Trash2,
  Pencil,
} from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';
import { submitIncidentReportAction } from '@/app/actions';

import { RoutePlanner } from './route-planner';
import { MapView } from './map-view';

const AppHeader = () => (
  <div className="flex items-center gap-3">
    <Shield className="w-8 h-8 text-primary" />
    <h1 className="text-2xl font-bold text-foreground">SafeRoute</h1>
  </div>
);

const SafetyScoreCard = ({ result }: { result: SafetyScoreResult }) => {
  if (!result || !Array.isArray(result.allRoutes) || result.allRoutes.length === 0) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score > 75) return 'bg-green-500';
    if (score > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const safestRoute = result.allRoutes[0];
  const alternativeRoutes = result.allRoutes.slice(1);

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
              {alternativeRoutes.map((route, index) => (
                <li key={route.originalIndex}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Alternative {index + 1}</span>
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

type Contact = { id: string; name: string; relation: string; };

const EmergencyContactForm = ({
  onSave,
  contact,
}: {
  onSave: (contact: Contact) => void;
  contact?: Contact | null;
}) => {
  const [name, setName] = useState(contact?.name || '');
  const [relation, setRelation] = useState(contact?.relation || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && relation) {
      onSave({
        id: contact?.id || Date.now().toString(),
        name,
        relation,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Jane Doe" required />
      </div>
      <div>
        <Label htmlFor="relation">Relation</Label>
        <Input id="relation" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="e.g., Sister" required />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Contact</Button>
      </DialogFooter>
    </form>
  );
};


const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Jane Doe', relation: 'Sister' },
    { id: '2', name: 'John Smith', relation: 'Friend' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleSaveContact = (contact: Contact) => {
    const existingIndex = contacts.findIndex(c => c.id === contact.id);
    if (existingIndex > -1) {
      const updatedContacts = [...contacts];
      updatedContacts[existingIndex] = contact;
      setContacts(updatedContacts);
    } else {
      setContacts([...contacts, contact]);
    }
    setIsDialogOpen(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Emergency Contacts
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={handleAddNew}>
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex justify-between items-center group">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.relation}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(contact)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(contact.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
              <DialogDescription>
                Enter the details of your emergency contact.
              </DialogDescription>
            </DialogHeader>
            <EmergencyContactForm
              onSave={handleSaveContact}
              contact={editingContact}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};


function SubmitButton() {
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

  useEffect(() => {
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
         <Input name="location" placeholder="Enter location of incident" required />
         {state?.fieldErrors?.location && <p className="text-sm text-destructive mt-1">{state.fieldErrors.location[0]}</p>}
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
      <SubmitButton />
    </form>
  )
}

export default function DashboardPage() {
  const [safetyResult, setSafetyResult] = useState<SafetyScoreResult | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
              <SafeSpotsList result={safetyResult} />
              <EmergencyContacts />
            </div>
          </ScrollArea>
        </aside>
        <main className="flex-1 relative">
          <MapView route={safetyResult ? { from: safetyResult.from!, to: safetyResult.to!, allRoutes: safetyResult.allRoutes } : null} />
          <div className="absolute top-4 right-4 flex gap-2">
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
            <Button variant="destructive" className="font-bold shadow-lg animate-pulse">
              SOS
            </Button>
          </div>
        </main>
      </div>
    </APIProvider>
  );
}
