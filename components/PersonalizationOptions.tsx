import React from 'react';
import type { Tone, ContentType } from '../types';
import { TONES, CONTENT_TYPES } from '../types';
import { RotateCwIcon } from './icons';

interface PersonalizationOptionsProps {
  tone: Tone;
  setTone: (tone: Tone) => void;
  contentTypes: ContentType[];
  setContentTypes: (types: ContentType[]) => void;
  disabled: boolean;
  onRegenerate: () => void;
  imageLoaded: boolean;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  titles: 'Titres',
  captions: 'Légendes',
  excerpts: 'Extraits Littéraires',
};

export const PersonalizationOptions: React.FC<PersonalizationOptionsProps> = ({
  tone,
  setTone,
  contentTypes,
  setContentTypes,
  disabled,
  onRegenerate,
  imageLoaded,
}) => {
  const handleContentTypeChange = (type: ContentType) => {
    const newContentTypes = contentTypes.includes(type)
      ? contentTypes.filter((t) => t !== type)
      : [...contentTypes, type];
    setContentTypes(newContentTypes);
  };

  return (
    <div className="bg-white dark:bg-bunker-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Options de Génération</h3>
      <div>
        <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ton
        </label>
        <select
          id="tone-select"
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-bunker-700 rounded-lg bg-gray-50 dark:bg-bunker-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TONES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contenus à générer
        </label>
        <div className="space-y-2">
          {CONTENT_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contentTypes.includes(type)}
                onChange={() => handleContentTypeChange(type)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 dark:border-bunker-700 text-blue-600 focus:ring-blue-500 dark:bg-bunker-800 dark:checked:bg-blue-500"
              />
              <span className="text-sm text-gray-800 dark:text-gray-200">{CONTENT_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pt-2">
        <button
          onClick={onRegenerate}
          disabled={disabled || !imageLoaded}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-bunker-900 disabled:bg-gray-400 dark:disabled:bg-bunker-700 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCwIcon className="w-5 h-5" />
          Régénérer
        </button>
      </div>
    </div>
  );
};