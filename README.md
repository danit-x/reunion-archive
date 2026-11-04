# The Reunion Archive

*Years Apart. One Place. A Thousand Memories.*

A school reunion website and organiser dashboard, built as a frontend demo with React, TypeScript and Vite. All data is stored in the browser.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

- **Organiser dashboard:** `/admin`. The demo passcode is `reunion2026`.
- **Reset demo data:** Admin → Settings → *Reset demo data*.

## Stack

React 18, TypeScript, Vite, React Router, Framer Motion, Recharts, Lucide icons and jsPDF (loaded only when someone downloads a ticket). Styling is hand-written CSS with design tokens in `src/styles/tokens.css`.

## Structure

```
src/
  data/        types.ts (models) · seed.ts (all demo content) · store.tsx (shared state + localStorage) · images.ts
  lib/         utils, ticket PDF / calendar export, hooks
  components/  primitives (Reveal, LineReveal, Img, Field…), feedback (Toast, Modal, Confirm), Lightbox, Ticket
  layouts/     SiteLayout (nav, mobile menu, footer)
  pages/       public pages, account/, admin/
  styles/      tokens.css · base.css · site.css · pages.css · admin.css
```

## Replacing the demo content

- School, event, organiser and registration settings can be edited from the admin dashboard (Event Details and Settings), or as defaults in `src/data/seed.ts`.
- Photographs are listed in one place, `src/data/images.ts`.
- When you change the shape of the seed data, bump `DATA_VERSION` in `seed.ts`. Browsers holding older stored data will then reseed.

## Limitations

- Sign-in and admin access are **simulated** with localStorage. They are not secure and are only for demonstration.
- No payments are collected. The ticket shows the amount due on the day.
- Public pages never show attendees' phone numbers or email addresses.
- Photographs come from Unsplash. Portraits come from randomuser.me and are placeholders.
