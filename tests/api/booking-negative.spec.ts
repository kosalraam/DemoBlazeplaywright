import { test, expect } from '../../src/fixtures/api-fixtures';
import { buildBooking } from '../../src/data/bookings';
import type { Booking, CreateBookingResponse } from '../../src/api/booker-client';

test.describe('API Booking negative scenarios', () => {
  test('retrieving a non-existent booking returns 404', async ({ api }) => {
    const response = await api.getBooking(99_999_999);
    expect(response.status()).toBe(404);
  });

  test('updating without a token is forbidden', async ({ api }) => {
    const created = await api.createBooking(buildBooking());
    expect(created.status()).toBe(200);
    const { bookingid } = await created.json() as CreateBookingResponse;

    const response = await api.updateBooking(
      bookingid,
      buildBooking({ firstname: 'NoAuth' }),
      ''
    );
    expect(response.status()).toBe(403);
  });

  test('deleting without a token is forbidden', async ({ api }) => {
    const created = await api.createBooking(buildBooking());
    expect(created.status()).toBe(200);
    const { bookingid } = await created.json() as CreateBookingResponse;

    const response = await api.deleteBooking(bookingid, '');
    expect(response.status()).toBe(403);
  });

  test('creating a booking with an invalid payload is rejected', async ({ api }) => {
    const response = await api.createBooking({ firstname: 'OnlyName' } as unknown as Booking);
    expect(response.ok()).toBe(false);
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
