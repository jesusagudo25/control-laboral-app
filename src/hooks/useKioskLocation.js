import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

const requiresLocation = (geoLocationPolicy) =>
  geoLocationPolicy === "1" || geoLocationPolicy === "2";

const useKioskLocation = (geoLocationPolicy, isWorkerSessionActive) => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const locationRequestRef = useRef(0);

  const resetLocation = useCallback(() => {
    locationRequestRef.current += 1;
    setLocation(null);
    setLocationError(null);
    setIsLoadingLocation(false);
  }, []);

  useEffect(() => {
    let isActive = true;
    const requestId = locationRequestRef.current + 1;
    locationRequestRef.current = requestId;
    const isCurrentRequest = () =>
      isActive && requestId === locationRequestRef.current;

    const prepareLocation = async () => {
      setLocation(null);
      setLocationError(null);

      if (!isWorkerSessionActive) {
        setIsLoadingLocation(false);
        return;
      }

      if (!requiresLocation(geoLocationPolicy)) {
        setLocation({ latitude: 0, longitude: 0 });
        setIsLoadingLocation(false);
        return;
      }

      try {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (!isCurrentRequest()) return;

        if (status !== "granted") {
          setLocationError(
            "No se concedió permiso de ubicación. La sesión kiosco puede continuar, pero no se podrá preparar la ubicación.",
          );
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});

        if (!isCurrentRequest()) return;

        const { latitude, longitude } = currentLocation.coords;
        setLocation({ latitude, longitude });
      } catch {
        if (isCurrentRequest()) {
          setLocationError(
            "No se pudo obtener la ubicación. Comprueba que el GPS esté disponible e inténtalo nuevamente.",
          );
        }
      } finally {
        if (isCurrentRequest()) {
          setIsLoadingLocation(false);
        }
      }
    };

    prepareLocation();

    return () => {
      isActive = false;
    };
  }, [geoLocationPolicy, isWorkerSessionActive]);

  return { location, locationError, isLoadingLocation, resetLocation };
};

export default useKioskLocation;
