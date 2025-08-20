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

const Directions = ({ route }: MapViewProps) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
  
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !route) {
        if(directionsRenderer) {
            directionsRenderer.set('directions', null);
        }
        return;
    }

    directionsService
      .route({
        origin: route.from,
        destination: route.to,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then(response => {
        directionsRenderer.setDirections(response);
      });

  }, [directionsService, directionsRenderer, route]);


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
