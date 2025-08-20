
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Phone, User } from 'lucide-react';

type Contact = {
  id: number;
  name: string;
  phone: string;
};

const initialContacts: Contact[] = [
  { id: 1, name: 'Jane Doe', phone: '9876543210' },
  { id: 2, name: 'John Smith', phone: '8765432109' },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);

  const handleSaveContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    if (currentContact) {
      // Editing existing contact
      setContacts(contacts.map(c => c.id === currentContact.id ? { ...c, name, phone } : c));
    } else {
      // Adding new contact
      setContacts([...contacts, { id: Date.now(), name, phone }]);
    }
    setIsDialogOpen(false);
    setCurrentContact(null);
  };

  const handleAddNew = () => {
    setCurrentContact(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setCurrentContact(contact);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-8 space-y-6">
        <header className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
                <Phone className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Emergency Contacts</h1>
                    <p className="text-muted-foreground">Manage your trusted contacts</p>
                </div>
            </div>
            <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Contact
            </Button>
        </header>

        <Card>
            <CardHeader>
                <CardTitle>Your Contacts</CardTitle>
                <CardDescription>
                These contacts will be notified in case of an emergency.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {contacts.length > 0 ? (
                    <ul className="space-y-4">
                    {contacts.map(contact => (
                        <li key={contact.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-background rounded-full">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold">{contact.name}</p>
                                    <p className="text-sm text-muted-foreground">+91 {contact.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(contact.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>You haven't added any emergency contacts yet.</p>
                        <Button variant="link" onClick={handleAddNew}>Add one now</Button>
                    </div>
                )}
            </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
              <DialogDescription>
                {currentContact ? 'Update the details for your emergency contact.' : 'Add a new person to your emergency contact list.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveContact}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={currentContact?.name || ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                   <div className="flex items-center">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-sm text-muted-foreground">+91</span>
                      <Input id="phone" name="phone" type="tel" pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number" className="rounded-l-none" defaultValue={currentContact?.phone || ''} required />
                    </div>
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                 </DialogClose>
                <Button type="submit">Save Contact</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
