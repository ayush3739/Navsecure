
'use client';

import { useEffect, useState } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { MapPin, ShieldCheck, Hospital, HeartHandshake } from 'lucide-react';

export const SafeSpotsList = () => {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [safeSpots, setSafeSpots] = useState<google.maps.places.PlaceResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (placesLibrary && map) {
      setPlacesService(new placesLibrary.PlacesService(map));
    }
  }, [placesLibrary, map]);

  useEffect(() => {
    if (!placesService) return;

    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        
        const requests = [
          { keyword: 'police', radius: 5000, location },
          { keyword: 'hospital', radius: 5000, location },
          { keyword: "women's shelter", radius: 5000, location },
        ];

        const promises = requests.map(request => new Promise<google.maps.places.PlaceResult[]>((resolve) => {
            placesService.nearbySearch(request, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                resolve(results);
              } else {
                resolve([]);
              }
            });
        }));

        Promise.all(promises).then(resultsArrays => {
          const allSpots = resultsArrays.flat().sort((a,b) => (a.rating || 0) - (b.rating || 0)).slice(0,5);
          setSafeSpots(allSpots);
          setLoading(false);
        });

      }, (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, [placesService]);

  const getIcon = (types?: string[]) => {
    if (types?.includes('police')) return <ShieldCheck className="w-6 h-6 text-muted-foreground" />;
    if (types?.includes('hospital')) return <Hospital className="w-6 h-6 text-muted-foreground" />;
    return <HeartHandshake className="w-6 h-6 text-muted-foreground" />;
  };
  
  const getSpotType = (types?: string[]) => {
    if (types?.includes('police')) return 'Police';
    if (types?.includes('hospital')) return 'Hospital';
    return 'Shelter';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Nearby Safe Spots
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <div className='space-y-2'>
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[100px]" />
                    </div>
                </div>
            ))}
          </div>
        ) : safeSpots.length > 0 ? (
          <ul className="space-y-4">
            {safeSpots.map((spot) => (
              <li key={spot.place_id} className="flex items-center gap-4">
                {getIcon(spot.types)}
                <div>
                  <p className="font-medium">{spot.name}</p>
                  <p className="text-sm text-muted-foreground">{getSpotType(spot.types)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
            <p className="text-sm text-muted-foreground">No safe spots found nearby.</p>
        )}
      </CardContent>
    </Card>
  );
};
