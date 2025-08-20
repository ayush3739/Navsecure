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
    safestRouteIndex?: number;
    allRoutes: SafetyScoreResult['allRoutes'];
  } | null;
};

const getRouteColor = (score: number) => {
  if (score > 75) return 'hsl(120, 100%, 35%)'; // A vibrant green
  if (score > 40) return 'hsl(48, 100%, 50%)'; // A clear yellow
  return 'hsl(0, 100%, 50%)'; // A distinct red
};

const Directions = ({ route }: MapViewProps) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderers, setDirectionsRenderers] = useState<google.maps.DirectionsRenderer[]>([]);
  
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
  }, [routesLibrary, map]);

  useEffect(() => {
    // Clear existing renderers
    directionsRenderers.forEach(renderer => renderer.setMap(null));
    setDirectionsRenderers([]);

    if (!directionsService || !map || !route) {
      return;
    }

    directionsService
      .route({
        origin: route.from,
        destination: route.to,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then(response => {
        const newRenderers = response.routes.map((r, index) => {
          const routeAnalysis = route.allRoutes[index];
          const isSafest = index === route.safestRouteIndex;
          
          const renderer = new google.maps.DirectionsRenderer({
            map,
            directions: { ...response, routes: [r] }, // Render one route per renderer
            routeIndex: 0, // We are only passing one route to each renderer
            polylineOptions: {
              strokeColor: getRouteColor(routeAnalysis?.safetyScore ?? 0),
              strokeOpacity: isSafest ? 1.0 : 0.8,
              strokeWeight: isSafest ? 8 : 6,
            },
          });
          return renderer;
        });
        setDirectionsRenderers(newRenderers);
      });

  }, [directionsService, map, route]);


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
