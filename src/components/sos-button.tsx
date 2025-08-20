
'use client';

import React from 'react';

export const SOSButton = () => {
  const [isPressed, setIsPressed] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
        // In a real app, this would trigger an emergency alert to contacts.
        alert('Emergency Alert Activated!');
        setIsPressed(false);
    }, 3000);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div
      className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer select-none group"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse group-hover:animate-none"></div>
      <div 
        className={`absolute inset-0 bg-red-600 rounded-full transition-transform duration-[3s] ease-linear ${isPressed ? 'scale-100' : 'scale-0'}`} 
        style={{transformOrigin: 'center'}}
      ></div>
      <div className="relative w-20 h-20 bg-red-700 rounded-full flex items-center justify-center shadow-inner">
        <span className="text-white text-xl font-bold">SOS</span>
      </div>
    </div>
  );
}
