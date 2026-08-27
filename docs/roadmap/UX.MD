Proposed fix plan
1. Booking form field alignment
- The grid uses grid gap-4 md:grid-cols-2 but items stretch to the tallest item in the row, and browser defaults for type="number"/type="email"/select can differ slightly from type="text".
- Fix:
- Add items-start to the grid so each field row tops-aligns.
- Ensure .field input, .field select use box-border, identical min-h-12, and consistent vertical padding.
- Make Field, Select, and SlotSelect render the same internal structure so error-message spacing is uniform.
2. Consultation type is a single fixed value
- Since consultationTypes has only one item (Psychiatric Consultation), remove the visible dropdown.
- Add a hidden input consultationType="Psychiatric Consultation" and hardcode it in the submit payload.
- Remove consultationType from validation/touched state.
3. Booking date/time picker UX
- Replace the long date dropdown list with a native <input type="date"> calendar picker.
- Keep time selection as a clean styled <select> of available 30-minute slots for the chosen date.
- Constrain the date picker to the range of available dates and validate that the chosen date/time is still in the published slots.
4. Admin page loading state
- Replace the plain-text Checking admin access... box with a centered loader card matching the existing AccountPage style (spinner + text).
5. Duplicate “Admin workspace” header in Prescriptions tab
- Remove the outer section-heading block from AdminPage.
- Add an embedded prop to PrescriptionWorkspace so it hides its own page header and white-shell background when shown inside the admin tab, while keeping the standalone /clinician/prescriptions page unchanged.
6. Redesign availability editor
- Remove the disabled “Duration” and “Timezone” inputs; show them as helper text instead (30-minute slots · Asia/Kolkata).
- Replace the per-day checkbox rows with compact day-of-week chips/toggles.
- Provide a single From / To time range that applies to all selected days, so setting 9 AM – 9 PM for every day is one action.
- Keep presets: All days / Weekdays / Custom.
- Keep blocked dates and blocked individual slots, but with a cleaner compact layout.
Clarifying questions before I start
1. Booking time input: Do you want the time as a dropdown list of available slots, or would you prefer a native clock/time input restricted to the available window?
2. Availability hours: Is one start/end time for all selected days enough for now, or do you need different hours for weekdays vs weekends? (I recommend one shared range to match your feedback.)
3. Admin loading: Should the loader be the same spinner style used on the Account page, or do you have a different preference?
Status: implemented in branch `feat/ux-polish-admin-booking` (2026-08-27).
- Date/time picker uses native calendar date + native time input constrained to available slots.
- Availability editor uses day chips and a single shared From/To range.
- Admin and clinician loading states now reuse the shared `LoadingState` component.