import { useState, useEffect, useCallback } from 'react';

const useServicesMap = (allServices) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.5074, -0.1278]); // Default to London
  const [closestService, setClosestService] = useState(null);
  const [findingLocation, setFindingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Find closest service to a location
  const findClosestService = useCallback((lat, lng, services) => {
    let closest = null;
    let minDistance = Infinity;

    services.forEach(service => {
      const distance = calculateDistance(
        lat, lng,
        service.location.lat,
        service.location.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = { ...service, distance: distance.toFixed(1) };
      }
    });

    return closest;
  }, [calculateDistance]);

  // Handle locate me button
  const handleLocateMe = useCallback(() => {
    setFindingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setFindingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        
        const closest = findClosestService(latitude, longitude, allServices);
        setClosestService(closest);
        
        setFindingLocation(false);
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please ensure location services are enabled.');
        setFindingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [allServices, findClosestService]);

  // Navigate to nearest service
  const navigateToNearest = useCallback(() => {
    if (closestService && userLocation) {
      setMapCenter([closestService.location.lat, closestService.location.lng]);
    }
  }, [closestService, userLocation]);

  return {
    userLocation,
    mapCenter,
    closestService,
    findingLocation,
    locationError,
    handleLocateMe,
    navigateToNearest,
    setMapCenter
  };
};

export default useServicesMap;