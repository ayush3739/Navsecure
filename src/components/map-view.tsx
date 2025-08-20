
'use client';

import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  Pin
} from '@vis.gl/react-google-maps';
import { Hospital, ShieldCheck, HeartHandshake, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SafetyScoreResult } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

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
  const { toast } = useToast();
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
        
        const routeColors = ['#16A34A', '#F97316', '#DC2626'];

        const sortedGoogleRoutes = [...response.routes];
        
        const ourSortedRoutes = route.allRoutes;

        ourSortedRoutes.forEach((ourRoute, ourIndex) => {
            const googleRouteIndex = ourRoute.originalIndex;
            const googleRoute = sortedGoogleRoutes[googleRouteIndex];

            if (googleRoute) {
                const color = routeColors[ourIndex] || routeColors[routeColors.length - 1];
                const renderer = new (routesLibrary.DirectionsRenderer)({
                    map,
                    directions: response,
                    routeIndex: googleRouteIndex,
                    polylineOptions: {
                    strokeColor: color,
                    strokeOpacity: ourIndex === 0 ? 1.0 : 0.8,
                    strokeWeight: ourIndex === 0 ? 8 : 6,
                    },
                    suppressMarkers: true,
                });
                newRenderers.push(renderer);
            }
        });
        
        setDirectionsRenderers(newRenderers);
      }).catch((e: google.maps.MapsRequestError) => {
        console.error('Directions request failed', e);
        if (e.code === 'ZERO_RESULTS') {
            toast({
                variant: 'destructive',
                title: 'No Route Found',
                description: 'No routes could be found for the selected locations.',
            });
        }
      });

  // Cleanup function to clear renderers when component unmounts or deps change
  return () => {
    directionsRenderers.forEach(r => r.setMap(null));
  };

  }, [directionsService, route, map, routesLibrary, toast]);

  return null;
}

const MapLegend = () => {
  return (
    <Card className="m-2 p-3 bg-card/80 backdrop-blur-sm">
      <h4 className="text-md font-semibold mb-2">Route Safety</h4>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-green-500 fill-green-500" />
          <span>Safest</span>
        </li>
        <li className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-orange-500 fill-orange-500" />
          <span>Moderate</span>
        </li>
        <li className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-red-500 fill-red-500" />
          <span>Less Safe</span>
        </li>
      </ul>
      <div className="border-t my-2 border-border"></div>
      <div className="flex items-center gap-2 text-sm">
        <ShieldCheck className="h-4 w-4 text-blue-500" />
        <span>Safe Spots</span>
      </div>
    </Card>
  )
}

const DynamicSafeSpots = () => {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [safeSpots, setSafeSpots] = useState<google.maps.places.PlaceResult[]>([]);
  
  useEffect(() => {
    if (placesLibrary && map) {
      setPlacesService(new placesLibrary.PlacesService(map));
    }
  }, [placesLibrary, map]);

  useEffect(() => {
    if (!placesService) return;

    navigator.geolocation.getCurrentPosition(position => {
      const location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      
      const keywords = ['police', 'hospital', "women's shelter"];

      const searchPromises = keywords.map(keyword => {
        return new Promise<google.maps.places.PlaceResult[]>((resolve) => {
          placesService.nearbySearch({ location, radius: 5000, keyword }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              resolve([]);
            }
          });
        });
      });
      
      Promise.all(searchPromises).then(resultsArrays => {
        const allSpots = resultsArrays.flat().filter(spot => spot.geometry && spot.geometry.location);
        setSafeSpots(allSpots.slice(0, 10)); // Limit to 10 spots for performance
      });
    });
  }, [placesService]);

  const getIcon = (types?: string[]) => {
    if (types?.includes('police')) return <ShieldCheck className="h-5 w-5 text-blue-400" />;
    if (types?.includes('hospital')) return <Hospital className="h-5 w-5 text-green-400" />;
    return <HeartHandshake className="h-5 w-5 text-pink-400" />;
  };

  return (
    <>
      {safeSpots.map((spot) => (
        spot.geometry?.location && (
          <AdvancedMarker key={spot.place_id} position={spot.geometry.location} title={spot.name}>
            <div className='p-2 bg-card rounded-full shadow-lg'>
              {getIcon(spot.types)}
            </div>
          </AdvancedMarker>
        )
      ))}
    </>
  );
};


export function MapView({ route }: MapViewProps) {
  const position = { lat: 28.6139, lng: 77.2090 }; // Delhi

  return (
      <Map
        defaultCenter={position}
        defaultZoom={12}
        mapId="navsecure-map"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        className="w-full h-full"
        controlSize={28}
      >
        <div className='absolute bottom-2 left-2'>
          <MapLegend />
        </div>
        
        <Directions route={route} />
        <DynamicSafeSpots />

      </Map>
  );
}
