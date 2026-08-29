# Booking Confidence UX Plan

## Summary

Improve the booking journey so patients understand what is happening, what is required, and what to do next. Keep the existing one-page form and backend booking sequence; do not introduce a new booking architecture or unnecessary animation.

## Implementation Changes

### Booking form

- Keep the single-page layout, but add clear visual sections:
  - **Your details**
  - **Appointment preference**
  - **Anything you would like to share**
- Keep age, phone, email, consultation type, date, and time required.
- Add concise helper copy explaining that the preferred date/time is a request, the clinic will confimage.pngirm availability by email, and optional messages should not contain emergency details.
- Improve inline validation by validating on blur and change after the first error, focusing the first invalid field, preserving entered values after API errors, and using field-specific messages.
- Add immediate press feedback and a clear submitting state. Disable duplicate submission and show `Sending your request...` while processing.
- Keep the form visible after an API failure and provide a clear retry path without clearing fields.

### Confirmation state

- Keep the current confirmation structure.
- Explain that booking details and meeting information were sent by email.
- Tell logged-in users they can review the request in **My account**.
- Explain that the Meet link becomes joinable 15 minutes before the consultation.
- Do not show an immediate Add to Calendar or Join action on the confirmation screen.

### Shared interaction and accessibility polish

- Add visible `:active` feedback to primary and secondary actions.
- Ensure focus rings are visible for keyboard users.
- Add reduced-motion handling for existing transitions and accordion behavior.
- Keep animations limited to feedback and state changes.
- Preserve the existing token-based palette and spacing system.

### Account follow-through

- Keep the existing booking history behavior.
- Make each booking card prioritize the requested date/time, booking status, meeting availability, and timed Join action.
- Keep the 15-minute Join rule and periodic time refresh.
- Retain the calendar link in booking history as an optional secondary action.

## Interfaces and Data

- No new database fields or authentication changes.
- No change to the public booking API payload.
- No change to Cosmos, Resend, Firebase, or Google Calendar configuration.
- The frontend continues to treat booking as one asynchronous operation and does not display backend sub-step completion that it cannot reliably observe.

## Test Plan

- Submit a valid booking and verify the button immediately changes state and cannot be double-submitted.
- Trigger each validation error and verify the correct field is identified, focus moves to the first invalid field, and existing values remain intact.
- Simulate an API failure and verify the form remains populated and retryable.
- Verify confirmation copy for guest and authenticated users.
- Verify mobile layout at narrow widths without overlap.
- Verify keyboard navigation and visible focus.
- Verify `prefers-reduced-motion: reduce`.
- Run `npm run lint` and `npm run build`.

## Assumptions

- The current synchronous backend flow remains unchanged for this UX pass.
- Preferred date and time remain a request until the clinic confirms availability.
- Guest booking remains available without login.
- Existing email and account follow-up paths remain the source of appointment details.
