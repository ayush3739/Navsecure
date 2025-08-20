
'use client';

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="p-6 md:p-8 space-y-6">
        <header className="flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings</p>
            </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <Button>Change Photo</Button>
                <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Test User" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="user@example.com" disabled />
                </div>
            </div>

             <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-sm text-muted-foreground">+91</span>
                    <Input id="phone" type="tel" className="rounded-l-none" defaultValue="9876543210" />
                </div>
            </div>

            <div className='flex justify-end'>
                <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
