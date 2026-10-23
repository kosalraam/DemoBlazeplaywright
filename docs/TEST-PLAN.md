# Test Plan

## UI coverage (DemoBlaze)

- Authentication: sign-up, login, invalid password, unknown user, duplicate username.
- Product browsing: catalogue, category filters, product detail data.
- Cart: add item, total calculation, remove item.
- Checkout: successful order and incomplete-order validation.

## API coverage (Restful-Booker)

- Health endpoint.
- Authentication with valid and invalid credentials.
- Booking create, list, retrieve, partial update, full update, delete.
- Negative cases for missing booking, missing auth token, and invalid create payload.

## Execution

- API only: `npm run test:api`
- Chromium UI: `npm run test:chromium`
- All projects: `npm test`

## Caveats

The framework targets public demo services. Availability, shared state, rate limiting, and service-side changes can cause transient failures unrelated to the test code. Use retries as a safety net, not as a substitute for investigating repeated failures.
