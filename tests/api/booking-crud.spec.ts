import { test, expect } from '../../src/fixtures/api-fixtures';
import { buildBooking } from '../../src/data/bookings';
import type { CreateBookingResponse } from '../../src/api/booker-client';
 
test.describe('API · Booking CRUD', () => {
  test('a booking can be created and echoed back', async ({ api }) => {
    const payload = buildBooking();
    const response = await api.createBooking(payload);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as CreateBookingResponse;
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking).toMatchObject(payload);
  });
 
  test('the booking list returns an array of ids', async ({ api }) => {
    const response = await api.listBookingIds();
    expect(response.status()).toBe(200);
    const ids = await response.json();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids[0]).toHaveProperty('bookingid');
  });
 
  test('a partial update changes only the provided fields', async ({ api, apiToken }) => {
    const created = await api.createBooking(buildBooking());
    const { bookingid } = (await created.json()) as CreateBookingResponse;
    const response = await api.partiallyUpdateBooking(bookingid, { firstname: 'Patched' }, 
      apiToken);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('Patched');
    expect(body.lastname).toBe('Doe');
    await api.deleteBooking(bookingid, apiToken);
  });
 
  test('full lifecycle: authenticate → create → retrieve → validate → update → validate → delete → verify', async ({
    api,
    apiToken,
  }) => {
    // Create
    const payload = buildBooking();
    const createResponse = await api.createBooking(payload);
    expect(createResponse.status()).toBe(200);
    const { bookingid } = (await createResponse.json()) as CreateBookingResponse;
    expect(bookingid).toBeGreaterThan(0);
 
    // Retrieve + validate it matches what we created
    const getResponse = await api.getBooking(bookingid);
    expect(getResponse.status()).toBe(200);
    expect(await getResponse.json()).toMatchObject(payload);
 
    // Update (full replace, requires auth)
    const updatedPayload = buildBooking({ firstname: 'Jane', lastname: 'Smith', totalprice: 999 });
    const updateResponse = await api.updateBooking(bookingid, updatedPayload, apiToken);
    expect(updateResponse.status()).toBe(200);
    expect(await updateResponse.json()).toMatchObject(updatedPayload);
 
    // Validate the update persisted
    const afterUpdate = await api.getBooking(bookingid);
    expect(await afterUpdate.json()).toMatchObject({
      firstname: 'Jane',
      lastname: 'Smith',
      totalprice: 999,
    });
 
    // Delete (returns 201 Created on success)
    const deleteResponse = await api.deleteBooking(bookingid, apiToken);
    expect(deleteResponse.status()).toBe(201);
 
    // Verify it is gone
    const afterDelete = await api.getBooking(bookingid);
    expect(afterDelete.status()).toBe(404);
  });
});
 