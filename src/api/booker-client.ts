import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface CreateBookingResponse {
  bookingid: number;
  booking: Booking;
}

export class BookerClient {
  constructor(private readonly request: APIRequestContext) {}

  async healthCheck(): Promise<number> {
    const response = await this.request.get('/ping');
    return response.status();
  }

  async authenticate(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  async getToken(username: string, password: string): Promise<string> {
    const response = await this.authenticate(username, password);
    const body = await response.json() as { token?: string };
    if (!body.token) {
      throw new Error(`Authentication did not return a token (HTTP ${response.status()}).`);
    }
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
      headers: { Cookie: `token=${token}` }
    });
  }

  async partiallyUpdateBooking(
    id: number,
    partial: Partial<Booking>,
    token: string
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: partial,
      headers: { Cookie: `token=${token}` }
    });
  }

  async deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` }
    });
  }
}
