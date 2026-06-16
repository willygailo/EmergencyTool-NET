import { pool } from '../config/database';

export const dispatchService = {
  /**
   * Find the closest available responders to a given coordinate using Haversine formula
   * @param lat Origin latitude
   * @param lng Origin longitude
   * @param limit Number of responders to recommend (default 3)
   * @param maxDistanceKm Maximum search radius in kilometers (default 50)
   */
  getClosestResponders: async (lat: number, lng: number, limit = 3, maxDistanceKm = 50) => {
    try {
      const query = `
        WITH distances AS (
          SELECT 
            id, 
            user_id, 
            name, 
            agency, 
            status, 
            latitude, 
            longitude,
            (
              6371 * acos(
                cos(radians($1)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + 
                sin(radians($1)) * sin(radians(latitude))
              )
            ) AS distance_km
          FROM responders
          WHERE status = 'available'
            AND latitude IS NOT NULL 
            AND longitude IS NOT NULL
        )
        SELECT * FROM distances
        WHERE distance_km < $3
        ORDER BY distance_km ASC
        LIMIT $4
      `;

      const result = await pool.query(query, [lat, lng, maxDistanceKm, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error calculating closest responders:', error);
      return [];
    }
  }
};
