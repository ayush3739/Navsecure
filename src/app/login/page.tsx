
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FormEvent } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

export default function LoginPage() {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    if (email) {
        try {
            localStorage.setItem('userEmail', email);
        } catch (error) {
            console.error("Could not access localStorage", error);
        }
    }
    router.push('/contacts');
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
        <div className="relative flex items-center justify-center min-h-screen bg-background">
            <div className="absolute inset-0 w-full h-full z-0">
                <Map
                    defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
                    defaultZoom={10}
                    gestureHandling={'none'}
                    disableDefaultUI={true}
                    mapId="login-map"
                    className="w-full h-full filter blur-sm"
                />
                 <div className="absolute inset-0 bg-background/60"></div>
            </div>
            <div className="relative z-10 grid md:grid-cols-2 items-center gap-16 max-w-6xl mx-auto p-4">
                <div className="text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">
                        NavSecure
                    </h1>
                    <p className="mt-4 text-lg text-primary-foreground/80">
                        Your trusted partner in safe navigation.
                    </p>
                </div>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email below to login to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="ml-auto inline-block text-sm underline">
                            Forgot your password?
                            </Link>
                        </div>
                        <Input id="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                        Login
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="underline">
                        Sign up
                        </Link>
                    </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </APIProvider>
  );
}
