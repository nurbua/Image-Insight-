import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ThemeToggle } from './components/ThemeToggle';
import { FullscreenToggle } from './components/FullscreenToggle';
import { Loader } from './components/Loader';
import { PersonalizationOptions } from './components/PersonalizationOptions';
import { generateContent } from './services/geminiService';
import { parseExifData } from './services/exifService';
import { getLocationFromCoords } from './services/locationService';


import type { ExifData, LiteraryExcerpt, Theme, Tone, ContentType, LocationData } from './types';
import { TONES, CONTENT_TYPES } from './types';
import { LogoIcon, CameraIcon, SparklesIcon, SlidersHorizontalIcon, MapPinIcon } from './components/icons';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [titles, setTitles] = useState<string[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [excerpts, setExcerpts] = useState<LiteraryExcerpt[]>([]);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [ai, setAi] = useState<GoogleGenAI | null>(null);

  const [tone, setTone] = useState<Tone>(TONES[0]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([...CONTENT_TYPES]);
  
  useEffect(() => {
    if (process.env.API_KEY) {
      setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
    } else {
       setError("La clé API Gemini n'est pas configurée.");
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const fetchLocation = async () => {
        if (exifData?.gps) {
            const loc = await getLocationFromCoords(exifData.gps.latitude, exifData.gps.longitude);
            setLocation(loc);
        } else {
            setLocation(null);
        }
    };

    fetchLocation();
}, [exifData]);

  const resetState = (keepImage: boolean = false) => {
    setTitles([]);
    setCaptions([]);
    setExcerpts([]);
    setExifData(null);
    setError(null);
    setLocation(null);
    if (!keepImage) {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleImageProcess = useCallback(async (file: File) => {
    if (!ai) {
      setError("Le client Gemini API n'est pas initialisé.");
      return;
    }
    if (contentTypes.length === 0) {
        setError("Veuillez sélectionner au moins un type de contenu à générer.");
        return;
    }
    
    setIsLoading(true);
    resetState(true);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      const [exifResult, contentResult] = await Promise.all([
        parseExifData(file),
        generateContent(ai, file, { tone, contentTypes })
      ]);
      
      if(contentResult) {
        setTitles(contentResult.titles);
        setCaptions(contentResult.captions);
        setExcerpts(contentResult.excerpts);
      }
      setExifData(exifResult);

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de l'analyse de l'image. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, [ai, tone, contentTypes]);

  const handleRegenerate = useCallback(async () => {
    if (!ai || !imageFile) {
      setError("Aucune image n'est chargée pour la régénération.");
      return;
    }
    if (contentTypes.length === 0) {
        setError("Veuillez sélectionner au moins un type de contenu à générer.");
        return;
    }
    
    setIsLoading(true);
    // Réinitialiser uniquement le contenu de l'IA
    setTitles([]);
    setCaptions([]);
    setExcerpts([]);
    setError(null);

    try {
      const contentResult = await generateContent(ai, imageFile, { tone, contentTypes });
      
      if(contentResult) {
        setTitles(contentResult.titles);
        setCaptions(contentResult.captions);
        setExcerpts(contentResult.excerpts);
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la régénération du contenu. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, [ai, imageFile, tone, contentTypes]);


  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <header className="py-4 px-4 md:px-8 border-b border-gray-200 dark:border-bunker-800 sticky top-0 bg-white/80 dark:bg-bunker-950/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-10 w-10 text-gray-800 dark:text-gray-200" />
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Image Insight
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enrichissez vos images avec l'intelligence artificielle.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FullscreenToggle />
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
            <ImageUploader onImageReady={handleImageProcess} disabled={isLoading} imageLoaded={!!imageFile} />
            <PersonalizationOptions 
                tone={tone} 
                setTone={setTone} 
                contentTypes={contentTypes} 
                setContentTypes={setContentTypes} 
                disabled={isLoading}
                onRegenerate={handleRegenerate}
                imageLoaded={!!imageFile}
            />
            {error && (
              <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Erreur : </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>
          
          <div className="lg:mt-0 space-y-6">
            {imagePreview && (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-bunker-800 shadow-lg">
                    <img src={imagePreview} alt="Aperçu" className="w-full h-auto object-contain" />
                    {location && (
                      <div className="p-3 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center gap-2 text-sm border-t border-gray-200 dark:border-bunker-800">
                          <MapPinIcon className="w-4 h-4 text-gray-600 dark:text-gray-300 flex-shrink-0" />
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{location.fullAddress}</span>
                      </div>
                    )}
                </div>
            )}
            {isLoading ? (
              <Loader />
            ) : (
              (titles.length > 0 || captions.length > 0 || excerpts.length > 0 || exifData) ? (
                <ResultsDisplay
                  titles={titles}
                  captions={captions}
                  excerpts={excerpts}
                  exifData={exifData}
                  location={location}
                  hasImage={!!imagePreview}
                />
              ) : (
                !imagePreview && (
                    <div className="flex flex-col items-center justify-center text-center p-8 h-full bg-white dark:bg-bunker-900 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800">
                        <LogoIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Bienvenue sur Image Insight</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                            Transformez vos images en histoires. Téléchargez une image pour obtenir des titres, légendes, et extraits littéraires générés par l'IA.
                        </p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-2xl">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Suggestions IA</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Titres, légendes et plus.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CameraIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Données EXIF</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Détails de la prise de vue.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <SlidersHorizontalIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Personnalisation</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ajustez le ton et le contenu.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;