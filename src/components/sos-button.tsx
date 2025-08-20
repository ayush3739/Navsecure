
'use client';

import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, X } from 'lucide-react';
import { Button } from './ui/button';

const HOLD_TIME = 3000;
const COUNTDOWN_TIME = 3000;

type State = {
  status: 'idle' | 'pressing' | 'countdown' | 'activating' | 'confirmed';
  pressStartTime: number | null;
  countdown: number;
};

type Action =
  | { type: 'PRESS_START' }
  | { type: 'PRESS_END' }
  | { type: 'START_COUNTDOWN' }
  | { type: 'TICK_COUNTDOWN' }
  | { type: 'ACTIVATE' }
  | { type: 'CONFIRMED' }
  | { type: 'CANCEL' };

const initialState: State = {
  status: 'idle',
  pressStartTime: null,
  countdown: COUNTDOWN_TIME / 1000,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'PRESS_START':
      if (state.status === 'idle') {
        return { ...state, status: 'pressing', pressStartTime: Date.now() };
      }
      return state;
    case 'PRESS_END':
      if (state.status === 'pressing') {
        return { ...initialState };
      }
      return state;
    case 'START_COUNTDOWN':
      if (state.status === 'pressing') {
        return { ...state, status: 'countdown', countdown: COUNTDOWN_TIME / 1000 };
      }
      return state;
    case 'TICK_COUNTDOWN':
        if (state.status === 'countdown' && state.countdown > 1) {
            return {...state, countdown: state.countdown -1};
        } else if (state.status === 'countdown' && state.countdown <= 1) {
            return {...state, status: 'activating' };
        }
        return state;
    case 'ACTIVATE':
        if(state.status === 'countdown') {
            return { ...state, status: 'activating' };
        }
        return state;
    case 'CONFIRMED':
        if (state.status === 'activating') {
            return { ...state, status: 'confirmed' };
        }
        return state;
    case 'CANCEL':
      return { ...initialState };
    default:
      return state;
  }
}

export const SOSButton = ({ onActivate }: { onActivate: () => void }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupTimers = useCallback(() => {
    if(intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    let holdTimer: NodeJS.Timeout;
    if (state.status === 'pressing') {
      holdTimer = setTimeout(() => {
        dispatch({ type: 'START_COUNTDOWN' });
      }, HOLD_TIME);
    }
    return () => clearTimeout(holdTimer);
  }, [state.status]);


  useEffect(() => {
    if (state.status === 'countdown') {
        intervalRef.current = setInterval(() => {
            dispatch({type: 'TICK_COUNTDOWN'});
        }, 1000)
    } else if (state.status === 'activating') {
        cleanupTimers();
        onActivate();
        dispatch({type: 'CONFIRMED'});
    } else if (state.status === 'confirmed') {
        const resetTimer = setTimeout(() => {
            dispatch({type: 'CANCEL'})
        }, 3000);
        return () => clearTimeout(resetTimer);
    } else {
        cleanupTimers();
    }

    return () => cleanupTimers();

  }, [state.status, onActivate, cleanupTimers]);

  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dispatch({ type: 'PRESS_START' });
  }, []);

  const handlePressEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dispatch({ type: 'PRESS_END' });
  }, []);

  return (
    <div className="relative flex h-28 w-28 items-center justify-center select-none">
      {state.status === 'confirmed' ? (
        <div className="flex flex-col items-center text-center text-green-500">
          <ShieldCheck className="h-12 w-12" />
          <p className="mt-2 font-semibold text-sm">Alert Sent</p>
        </div>
      ) : state.status === 'countdown' || state.status === 'activating' ? (
        <div className="relative flex flex-col items-center justify-center text-center w-full h-full">
            <div
                className="absolute inset-0 rounded-full"
                style={{
                background: `conic-gradient(hsl(var(--destructive)) ${
                    (state.countdown * 1000 / COUNTDOWN_TIME) * 100
                }%, hsl(var(--muted)) 0)`,
                transition: 'background 1s linear',
                }}
            />
             <div className="relative flex flex-col h-24 w-24 items-center justify-center rounded-full bg-card shadow-inner">
                <span className="text-4xl font-bold text-destructive-foreground">{state.countdown}</span>
                <span className="text-xs text-muted-foreground">Sending Alert</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -bottom-2 h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
              onClick={() => dispatch({ type: 'CANCEL' })}
            >
              <X className="h-5 w-5" />
            </Button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-destructive/20 transition-transform duration-200",
              state.status === 'pressing' && "scale-110"
            )}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--destructive)) ${
                state.status === 'pressing' ? '100%' : '0%'
              }, transparent 0)`,
              transition: `background ${HOLD_TIME}ms linear`,
            }}
          />
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-destructive shadow-lg cursor-pointer"
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
          >
            <span className="text-xl font-bold text-destructive-foreground">
              SOS
            </span>
          </div>
          {state.status === 'pressing' && (
             <p className='absolute bottom-0 text-xs text-muted-foreground'>Hold to activate</p>
          )}
        </>
      )}
    </div>
  );
};
