export interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationHistory extends Location {
  createdAt: Date;
}

export interface ShareableLocation {
  token: string;
  url: string;
  expiresAt: Date;
  location: Location;
}

export interface BackgroundTrackingConfig {
  interval: number;
  distanceFilter: number;
  stopTimeout: number;
}

export default Location;