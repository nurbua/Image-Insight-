import type { LocationData } from '../types';

export const getLocationFromCoords = async (latitude: number, longitude: number): Promise<LocationData | null> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fr`);
        if (!response.ok) {
            console.error("Nominatim API error:", response.statusText);
            return null;
        }
        const data = await response.json();
        
        if (data.error) {
            console.error("Nominatim API error:", data.error);
            return { fullAddress: `Erreur de géolocalisation: ${data.error}` };
        }

        const address = data.address;
        if (!address) return { fullAddress: "Lieu inconnu" };

        const city = address.city || address.town || address.village;
        const state = address.state || address.county;
        const country = address.country;

        const locationParts = [
            city,
            state,
            country
        ].filter(Boolean);
        
        const fullAddress = locationParts.length > 0 ? locationParts.join(', ') : "Lieu inconnu";

        return {
            city,
            state,
            country,
            fullAddress
        };

    } catch (error) {
        console.error("Échec de la récupération des données de localisation:", error);
        return { fullAddress: "Impossible de récupérer la localisation" };
    }
};