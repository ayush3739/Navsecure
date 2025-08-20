
'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const AutocompletePortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
};

export const PlaceAutocomplete = ({ name, placeholder, error }: { name: string, placeholder: string, error?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const [pacContainer, setPacContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;
    
    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
    });
    
    const customPacContainer = document.createElement('div');
    autocomplete.set('pac-container', customPacContainer);
    
    setPacContainer(customPacContainer);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (inputRef.current && place.formatted_address) {
        inputRef.current.value = place.formatted_address;
      }
    });

    return () => {
      if (pacContainer?.parentElement) {
        pacContainer.parentElement.removeChild(pacContainer);
      }
    };

  }, [places]);

  return (
    <div className="space-y-2">
      <Input ref={inputRef} name={name} placeholder={placeholder} required />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {pacContainer && (
        <AutocompletePortal>
          <div ref={(node) => {
            if (node && pacContainer) {
              node.appendChild(pacContainer);
            }
          }}
          className={cn(
              "pac-container-wrapper z-[9999] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            )}
           />
        </AutocompletePortal>
      )}
    </div>
  );
};
