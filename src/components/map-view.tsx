'use client';

import { APIProvider, Map, AdvancedMarker, Polyline } from '@vis.gl/react-google-maps';
import { Hospital, ShieldCheck } from 'lucide-react';

export function MapView() {
  const position = { lat: 37.7749, lng: -122.4194 }; // San Francisco
  
  const mockRoutePath = [
    { lat: 37.779, lng: -122.429 },
    { lat: 37.775, lng: -122.425 },
    { lat: 37.772, lng: -122.419 },
    { lat: 37.774, lng: -122.412 },
  ];

  const safeSpots = [
    { id: 1, pos: { lat: 37.7752, lng: -122.4194 }, name: 'SF General Hospital', type: 'hospital' },
    { id: 2, pos: { lat: 37.778, lng: -122.423 }, name: 'Mission Police Station', type: 'police' },
  ];

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Google Maps API key is missing.</p>
          <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={position}
        defaultZoom={14}
        mapId="saferoute-map"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        className="w-full h-full"
      >
        <Polyline
            path={mockRoutePath}
            strokeColor="#8A2BE2"
            strokeOpacity={0.8}
            strokeWeight={6}
          />
        {safeSpots.map((spot) => (
          <AdvancedMarker key={spot.id} position={spot.pos} title={spot.name}>
            <div className='p-2 bg-card rounded-full shadow-lg'>
              {spot.type === 'hospital' ? <Hospital className="h-5 w-5 text-green-400" /> : <ShieldCheck className="h-5 w-5 text-blue-400" />}
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
