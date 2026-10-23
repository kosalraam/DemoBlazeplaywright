import { APIRequestContext, APIResponse } from '@playwright/test';
 
// Declared as `type` (not `interface`) so these shapes satisfy Record<string, unknown>,
// which expect().toMatchObject() requires.
export type BookingDates = {
  checkin: string;
  checkout: string;
};
 
export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
};
 
export type CreateBookingResponse = {
  bookingid: number;
  booking: Booking;
};
 
/**
 * Thin, typed wrapper around the Restful-Booker API. Returns raw APIResponse so
 * tests can assert on status codes as well as bodies.
 *
 * Auth model: write operations (PUT/PATCH/DELETE) require the token as a cookie.
 */
export class BookerClient {
  constructor(private readonly request: APIRequestContext) {}
 
  /** Health endpoint — returns HTTP 201 when the service is up. */
  async healthCheck(): Promise<number> {
    const response = await this.request.get('/ping');
    return response.status();
  }
 
  async authenticate(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }
 
  /** Convenience helper that returns just the token string. */
  async getToken(username: string, password: string): Promise<string> {
    const response = await this.authenticate(username, password);
    const body = await response.json();
    return body.token;
  }
 
  async createBooking(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }
 
  async getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }
 
  async listBookingIds(): Promise<APIResponse> {
    return this.request.get('/booking');
  }
 
  async updateBooking(id: number, booking: Booking, token: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
  }
 
  async partiallyUpdateBooking(
    id: number,
    partial: Partial<Booking>,
    token: string,
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: partial,
      headers: { Cookie: `token=${token}` },
    });
  }
 
  async deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` },
    });
  }
}
 
 