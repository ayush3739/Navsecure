
'use client';

import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Hospital, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SafetyScoreResult } from '@/lib/types';

type MapViewProps = {
  route: {
    from: string;
    to: string;
    allRoutes: SafetyScoreResult['allRoutes'];
  } | null;
};

const Directions = ({ route }: MapViewProps) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderers, setDirectionsRenderers] = useState<google.maps.DirectionsRenderer[]>([]);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    // Clear existing renderers when map or library changes
    directionsRenderers.forEach(r => r.setMap(null));
    setDirectionsRenderers([]);
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !map) return;
    
    // Clear previous routes
    directionsRenderers.forEach(r => r.setMap(null));
    setDirectionsRenderers([]);

    if (!route) return;

    directionsService
      .route({
        origin: route.from,
        destination: route.to,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then(response => {
        const newRenderers: google.maps.DirectionsRenderer[] = [];
        // The safest route is green, second is orange, third is red.
        const routeColors = ['#16A34A', '#F97316', '#DC2626'];

        response.routes.slice(0, 3).forEach((_, i) => {
          // Since allRoutes is sorted from safest to least safe, we can use the index directly.
          const color = routeColors[i] || routeColors[routeColors.length -1];
          
          const renderer = new routesLibrary.DirectionsRenderer({
            map,
            directions: response,
            routeIndex: i,
            polylineOptions: {
              strokeColor: color,
              strokeOpacity: i === 0 ? 1.0 : 0.8, // Highlight safest route
              strokeWeight: i === 0 ? 8 : 6,
            },
          });
          newRenderers.push(renderer);
        });
        setDirectionsRenderers(newRenderers);
      }).catch(e => console.error('Directions request failed', e));

  // Cleanup function to clear renderers when component unmounts or deps change
  return () => {
    directionsRenderers.forEach(r => r.setMap(null));
  };

  }, [directionsService, route, map, routesLibrary]);

  return null;
}

export function MapView({ route }: MapViewProps) {
  const position = { lat: 28.6139, lng: 77.2090 }; // Delhi
  
  const safeSpots = [
    { id: 1, pos: { lat: 28.6358, lng: 77.2244 }, name: 'Lok Nayak Hospital', type: 'hospital' },
    { id: 2, pos: { lat: 28.6324, lng: 77.2169 }, name: 'Connaught Place Police Station', type: 'police' },
  ];

  return (
      <Map
        defaultCenter={position}
        defaultZoom={12}
        mapId="saferoute-map"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        className="w-full h-full"
      >
        <Directions route={route} />
        {safeSpots.map((spot) => (
          <AdvancedMarker key={spot.id} position={spot.pos} title={spot.name}>
            <div className='p-2 bg-card rounded-full shadow-lg'>
              {spot.type === 'hospital' ? <Hospital className="h-5 w-5 text-green-400" /> : <ShieldCheck className="h-5 w-5 text-blue-400" />}
            </div>
          </AdvancedMarker>
        ))}
      </Map>
  );
}
