
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { ShieldCheck } from 'lucide-react';

export const SOSButton = ({ onAlertSent }: { onAlertSent: () => void }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimeouts = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (isActivating) {
      setCountdown(3);
      countdownTimerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearAllTimeouts();
  }, [isActivating]);

  useEffect(() => {
    if (countdown === 0) {
      clearAllTimeouts();
      setIsActivating(false);
      onAlertSent();
    }
  }, [countdown, onAlertSent]);

  const handlePressStart = () => {
    setIsPressed(true);
    pressTimerRef.current = setTimeout(() => {
      setIsActivating(true);
      setIsPressed(false);
    }, 3000);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    clearAllTimeouts();
  };

  const handleCancel = () => {
    setIsActivating(false);
    clearAllTimeouts();
  };

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {isActivating ? (
        <div className="text-center">
          <div className="text-destructive text-lg font-semibold animate-pulse">Sending Alert in...</div>
          <div className="text-6xl font-bold text-destructive">{countdown}</div>
          <Button onClick={handleCancel} variant="secondary" className="mt-4">
            Cancel
          </Button>
        </div>
      ) : (
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer select-none group"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse group-hover:animate-none"></div>
          <div
            className={`absolute inset-0 bg-red-600 rounded-full transition-transform duration-[3s] ease-linear ${isPressed ? 'scale-100' : 'scale-0'}`}
            style={{ transformOrigin: 'center' }}
          ></div>
          <div className="relative w-20 h-20 bg-red-700 rounded-full flex items-center justify-center shadow-inner">
            <span className="text-white text-xl font-bold">SOS</span>
          </div>
        </div>
      )}
    </div>
  );
};
