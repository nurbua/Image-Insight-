import exifr from 'exifr';
import type { ExifData } from "../types";

/**
 * Analyse un fichier image à l'aide de la bibliothèque 'exifr' pour extraire les métadonnées.
 * @param file Le fichier image à analyser.
 * @returns Un objet ExifData ou null si aucune donnée n'a été trouvée.
 */
export const parseExifData = async (file: File): Promise<ExifData | null> => {
    try {
        const exif = await exifr.parse(file);
        
        if (!exif) return null;

        const data: ExifData = {};

        if (exif.Make) data.make = exif.Make;
        if (exif.Model) data.model = String(exif.Model).replace(/\0/g, '').trim();
        
        if (exif.FocalLength) data.focalLength = `${exif.FocalLength}mm`;
        
        if (exif.FNumber) data.fNumber = String(exif.FNumber);
        
        if (typeof exif.ExposureTime === 'number') {
            // Formate le temps d'exposition en fraction si nécessaire (ex: 1/125s)
            if (exif.ExposureTime < 1 && exif.ExposureTime > 0) {
                data.exposureTime = `1/${Math.round(1 / exif.ExposureTime)}`;
            } else {
                data.exposureTime = String(exif.ExposureTime);
            }
        }

        if (exif.ISO) data.iso = String(exif.ISO);
        
        // exifr fournit directement les coordonnées décimales
        if (typeof exif.latitude === 'number' && typeof exif.longitude === 'number') {
            data.gps = { latitude: exif.latitude, longitude: exif.longitude };
        }
        
        // Retourne les données uniquement si au moins une information a été extraite
        return Object.keys(data).length > 0 ? data : null;

    } catch (error) {
        console.error("Erreur lors de la lecture des données EXIF avec exifr:", error);
        return null;
    }
};