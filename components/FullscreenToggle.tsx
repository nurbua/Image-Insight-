import React, { useState, useEffect } from 'react';
import { EnterFullscreenIcon, ExitFullscreenIcon } from './icons';

export const FullscreenToggle: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <button
      onClick={toggleFullscreen}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-bunker-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-bunker-950"
      aria-label={isFullscreen ? "Quitter le mode plein écran" : "Activer le mode plein écran"}
    >
      {isFullscreen ? <ExitFullscreenIcon className="h-6 w-6" /> : <EnterFullscreenIcon className="h-6 w-6" />}
    </button>
  );
};
