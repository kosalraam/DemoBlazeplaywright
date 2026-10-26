import type { Booking } from '../api/booker-client';
import { config } from '../config/env';
 
/** Public demo credentials for Restful-Booker (resolved from central config; not secrets). */
export const ADMIN_CREDENTIALS = config.apiCredentials;
 
/** Builds a valid booking payload; override any field for targeted scenarios. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'John',
    lastname: 'Doe',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2025-01-01', checkout: '2025-01-10' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}