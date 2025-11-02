import React, { useEffect, useRef, useState } from 'react';
import type { ExifData, LiteraryExcerpt, LocationData } from '../types';
import { ResultCard } from './ResultCard';
import { CopyButton } from './CopyButton';
import { CameraIcon, MapPinIcon, BookOpenIcon, HashIcon, ApertureIcon } from './icons';

// Inform TypeScript that L is a global variable from the Leaflet script
declare const L: any;

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ latitude, longitude }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof L === 'undefined') {
        throw new Error("La bibliothèque de cartographie (Leaflet) n'a pas pu être chargée.");
      }
      if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Les coordonnées GPS fournies sont invalides.");
      }
      
      if (mapContainerRef.current && !mapRef.current) {
        setMapError(null);
        const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker([latitude, longitude]).addTo(map);
        markerRef.current = marker;
        
        return () => {
          if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
          }
        };
      }
    } catch (error) {
        console.error("Erreur de la carte interactive:", error);
        setMapError(error instanceof Error ? error.message : "Une erreur est survenue lors du chargement de la carte.");
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    try {
      if (mapRef.current && markerRef.current) {
        if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) {
          throw new Error("Les nouvelles coordonnées GPS sont invalides.");
        }
        setMapError(null);
        const newLatLng = L.latLng(latitude, longitude);
        mapRef.current.setView(newLatLng, 13);
        markerRef.current.setLatLng(newLatLng);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la carte:", error);
      setMapError(error instanceof Error ? error.message : "Impossible de mettre à jour la position sur la carte.");
    }
  }, [latitude, longitude]);
  
  if (mapError) {
    return (
      <div style={{ height: '300px', borderRadius: '8px' }} className="bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-center p-4 border border-red-300 dark:border-red-800">
        <div>
          <p className="font-semibold text-red-700 dark:text-red-300">Erreur de chargement de la carte</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{mapError}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} style={{ height: '300px', borderRadius: '8px', zIndex: 0 }}></div>;
};

interface ResultsDisplayProps {
  titles: string[];
  captions: string[];
  excerpts: LiteraryExcerpt[];
  exifData: ExifData | null;
  location: LocationData | null;
  hasImage: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ titles, captions, excerpts, exifData, location, hasImage }) => {
    if (!hasImage) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full bg-white dark:bg-bunker-900 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-bunker-800 rounded-full flex items-center justify-center mb-4">
                    <BookOpenIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">En attente d'une image</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Téléchargez une image pour commencer l'analyse.
                </p>
            </div>
        )
    }

  let cardIndex = 0;
  const getCardClassName = () => {
    const className = cardIndex++ % 2 === 0 
      ? 'bg-white dark:bg-bunker-900' 
      : 'bg-gray-50 dark:bg-bunker-800';
    return className;
  }

  return (
    <div className="space-y-6">
      {titles.length > 0 && (
        <ResultCard title="Titres Suggérés" icon={<HashIcon className="w-5 h-5" />} className={getCardClassName()}>
          <ul className="space-y-2">
            {titles.map((title, index) => (
              <li key={index} className="flex justify-between items-center gap-2 p-2 bg-gray-100 dark:bg-bunker-950 rounded-md">
                <span className="text-gray-700 dark:text-gray-300">{title}</span>
                <CopyButton textToCopy={title} />
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      {captions.length > 0 && (
        <ResultCard title="Légendes Suggérées" icon={<HashIcon className="w-5 h-5" />} className={getCardClassName()}>
          <ul className="space-y-2">
            {captions.map((caption, index) => (
              <li key={index} className="flex justify-between items-center gap-2 p-2 bg-gray-100 dark:bg-bunker-950 rounded-md">
                <span className="text-gray-700 dark:text-gray-300">{caption}</span>
                <CopyButton textToCopy={caption} />
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      {excerpts.length > 0 && (
        <ResultCard title="Extraits Littéraires" icon={<BookOpenIcon className="w-5 h-5" />} className={getCardClassName()}>
          <div className="space-y-4">
            {excerpts.map((excerpt, index) => (
              <div key={index} className="p-4 bg-gray-100 dark:bg-bunker-950 rounded-lg border border-gray-200 dark:border-bunker-800">
                <blockquote className="italic text-gray-700 dark:text-gray-300">
                  "{excerpt.extrait}"
                  {excerpt.traduction && <span className="block mt-2 text-sm text-gray-500 dark:text-gray-400">(Traduction: "{excerpt.traduction}")</span>}
                </blockquote>
                <p className="text-right mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  - {excerpt.auteur}, <cite>{excerpt.oeuvre}</cite>
                </p>
                <div className="mt-3 flex justify-end">
                    <CopyButton textToCopy={`${excerpt.extrait} - ${excerpt.auteur}, ${excerpt.oeuvre}`} />
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {exifData && (
        <ResultCard title="Données EXIF & Géolocalisation" icon={<CameraIcon className="w-5 h-5" />} className={getCardClassName()}>
          <div className="space-y-4 text-sm">
            {exifData.make && exifData.model && (
              <div className="flex items-center gap-3">
                <CameraIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span>{exifData.make} {exifData.model}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
                <ApertureIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span>
                    {exifData.focalLength && `${exifData.focalLength} `}
                    {exifData.fNumber && `ƒ/${exifData.fNumber} `}
                    {exifData.exposureTime && `${exifData.exposureTime}s `}
                    {exifData.iso && `ISO ${exifData.iso}`}
                </span>
            </div>
            {exifData.gps && (
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                 <div>
                  <span className="font-medium">Coordonnées GPS</span>
                  <span className="block text-gray-600 dark:text-gray-400">{Number(exifData.gps.latitude).toFixed(6)}, {Number(exifData.gps.longitude).toFixed(6)}</span>
                  {location && (
                      <div className="mt-2 text-gray-600 dark:text-gray-400 space-y-1">
                        {location.city && <p><strong className="font-semibold text-gray-700 dark:text-gray-300">Commune:</strong> {location.city}</p>}
                        {location.state && <p><strong className="font-semibold text-gray-700 dark:text-gray-300">Région:</strong> {location.state}</p>}
                        {location.country && <p><strong className="font-semibold text-gray-700 dark:text-gray-300">Pays:</strong> {location.country}</p>}
                      </div>
                  )}
                  <div className="mt-4">
                    <InteractiveMap latitude={exifData.gps.latitude} longitude={exifData.gps.longitude} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ResultCard>
      )}
    </div>
  );
};