import { Platform } from "react-native";
import * as Location from "expo-location";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  name?: string;
}

export class LocationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === "web") {
        return new Promise((resolve) => {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false),
              { timeout: 10000 }
            );
          } else {
            resolve(false);
          }
        });
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      if (Platform.OS === "web") {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        });
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }

  static async reverseGeocode(coordinates: LocationCoordinates): Promise<LocationAddress | null> {
    try {
      if (Platform.OS === "web") {
        // For web, we'd typically use a geocoding service like Google Maps API
        // For now, return a mock address
        return {
          street: "Sample Street",
          city: "Accra",
          region: "Greater Accra",
          country: "Ghana",
        };
      }

      const addresses = await Location.reverseGeocodeAsync(coordinates);
      if (addresses.length > 0) {
        const address = addresses[0];
        return {
          street: address.street || undefined,
          city: address.city || undefined,
          region: address.region || undefined,
          country: address.country || undefined,
          postalCode: address.postalCode || undefined,
          name: address.name || undefined,
        };
      }
      return null;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  }

  static async geocode(address: string): Promise<LocationCoordinates | null> {
    try {
      if (Platform.OS === "web") {
        // For web, we'd use a geocoding service
        // Return mock coordinates for Accra
        return {
          latitude: 5.6037,
          longitude: -0.1870,
        };
      }

      const locations = await Location.geocodeAsync(address);
      if (locations.length > 0) {
        const location = locations[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  }

  static calculateDistance(
    coord1: LocationCoordinates,
    coord2: LocationCoordinates
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(coord2.latitude - coord1.latitude);
    const dLon = this.deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coord1.latitude)) *
        Math.cos(this.deg2rad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  static isWithinDeliveryRadius(
    vendorLocation: LocationCoordinates,
    customerLocation: LocationCoordinates,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(vendorLocation, customerLocation);
    return distance <= radiusKm;
  }

  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  }

  static estimateDeliveryTime(distanceKm: number): number {
    // Base time + travel time (assuming 30 km/h average speed)
    const baseTimeMinutes = 15; // Preparation time
    const travelTimeMinutes = (distanceKm / 30) * 60;
    return Math.round(baseTimeMinutes + travelTimeMinutes);
  }
}