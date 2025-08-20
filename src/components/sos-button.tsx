
'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, X } from 'lucide-react';
import { Button } from './ui/button';

const ACTIVATION_TIME = 3000; // 3 seconds

type State = {
  status: 'idle' | 'pressing' | 'activating' | 'confirmed';
  startTime: number | null;
};

type Action =
  | { type: 'PRESS_START' }
  | { type: 'PRESS_END' }
  | { type: 'ACTIVATE' }
  | { type: 'CONFIRMED' }
  | { type: 'CANCEL' }
  | { type: 'RESET' };

const initialState: State = {
  status: 'idle',
  startTime: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'PRESS_START':
      if (state.status === 'idle') {
        return { status: 'pressing', startTime: Date.now() };
      }
      return state;
    case 'PRESS_END':
      if (state.status === 'pressing') {
        return { status: 'idle', startTime: null };
      }
      return state;
    case 'ACTIVATE':
      if (state.status === 'pressing') {
        return { ...state, status: 'activating' };
      }
      return state;
    case 'CONFIRMED':
        if (state.status === 'activating') {
            return { ...state, status: 'confirmed' };
        }
        return state;
    case 'CANCEL':
    case 'RESET':
      return { status: 'idle', startTime: null };
    default:
      return state;
  }
}

export const SOSButton = ({ onActivate }: { onActivate: () => void }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.status === 'pressing') {
      timer = setTimeout(() => {
        dispatch({ type: 'ACTIVATE' });
      }, ACTIVATION_TIME);
    }
    return () => clearTimeout(timer);
  }, [state.status]);

  useEffect(() => {
    let activationTimer: NodeJS.Timeout;
    if (state.status === 'activating') {
      onActivate();
      dispatch({type: 'CONFIRMED'});
      activationTimer = setTimeout(() => {
        dispatch({ type: 'RESET' });
      }, 3000); // Show confirmation for 3 seconds
    }
    return () => clearTimeout(activationTimer);
  }, [state.status, onActivate]);

  const handlePressStart = useCallback(() => {
    dispatch({ type: 'PRESS_START' });
  }, []);

  const handlePressEnd = useCallback(() => {
    dispatch({ type: 'PRESS_END' });
  }, []);

  return (
    <div className="relative flex h-36 w-36 items-center justify-center select-none">
      {state.status === 'confirmed' ? (
        <div className="flex flex-col items-center text-center text-green-500">
          <ShieldCheck className="h-16 w-16" />
          <p className="mt-2 font-semibold">Alert Sent</p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-destructive/20 transition-transform duration-200",
              (state.status === 'pressing' || state.status === 'activating') && "scale-110"
            )}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--destructive)) ${
                state.status === 'pressing' ? '100%' : '0%'
              }, transparent 0)`,
              transition: `background ${ACTIVATION_TIME}ms linear`,
            }}
          />
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full bg-destructive shadow-lg"
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
          >
            <span className="text-2xl font-bold text-destructive-foreground">
              SOS
            </span>
          </div>
          {(state.status === 'pressing' || state.status === 'activating') && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -bottom-4 h-10 w-10 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
              onClick={() => dispatch({ type: 'CANCEL' })}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};
