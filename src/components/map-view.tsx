'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { Hospital, ShieldCheck } from 'lucide-react';
import { useEffect, type FC } from 'react';

const Polyline: FC<google.maps.PolylineOptions> = (options) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const polyline = new google.maps.Polyline(options);
    polyline.setMap(map);
    return () => {
      polyline.setMap(null);
    };
  }, [map, options]);
  return null;
};

export function MapView() {
  const position = { lat: 28.6139, lng: 77.2090 }; // Delhi
  
  const mockRoutePath = [
    { lat: 28.6315, lng: 77.2167 }, // Connaught Place
    { lat: 28.6562, lng: 77.2410 }, // Red Fort
    { lat: 28.5245, lng: 77.1855 }, // Qutub Minar
  ];

  const safeSpots = [
    { id: 1, pos: { lat: 28.6358, lng: 77.2244 }, name: 'Lok Nayak Hospital', type: 'hospital' },
    { id: 2, pos: { lat: 28.6324, lng: 77.2169 }, name: 'Connaught Place Police Station', type: 'police' },
  ];

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
      <Map
        defaultCenter={position}
        defaultZoom={12}
        mapId="saferoute-map"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        className="w-full h-full"
      >
        <Polyline
            path={mockRoutePath}
            strokeColor="hsl(var(--secondary-foreground))"
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
