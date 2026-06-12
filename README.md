# Galam Pedia & OB Clinic Static Site

This directory contains a GitHub Pages-compatible static version of the original PHP/MySQL clinic website.

## What is included

- `index.html`, `about.html`, `doctors.html`, `services.html`, `schedule.html`, `reviews.html`, `contact.html`, `appointment.html`
- `assets/css/style.css` and supporting static assets
- `assets/js/site.js` for data loading and page-specific rendering
- `assets/js/main.js` for UI behavior, theme toggle, animations, and navigation
- `data/site_content.json`, `data/doctors.json`, `data/reviews.json` for clinic content and doctor/review data

## Static data flow

- Page content is rendered client-side using JSON files under `data/`.
- No PHP, no database, no backend processing is required for the static website.
- `site.js` reads `data/site_content.json`, `data/doctors.json`, and `data/reviews.json`.

## Forms and submission options

This static version includes form markup with placeholder submission targets. Replace the `action` attribute with your own provider endpoint:

- Formspree: `https://formspree.io/f/your_form_id`
- EmailJS: use client-side JS and `emailjs.send(...)`
- FormSubmit: `https://formsubmit.co/your-email@example.com`

Notes:
- GitHub Pages cannot process form submissions on the server.
- Use a third-party static form provider, Zapier, or email service to receive submissions.

## How to deploy

1. Commit the full `html_site/` folder to a public GitHub repository.
2. In GitHub, enable GitHub Pages on the repository settings.
3. Set the source to the repository root or `/docs` folder depending on your branch.
4. Push the static assets and data files.

## Optional enhancements

- Add `404.html` for not-found routing.
- Add search and filtering for doctors and reviews.
- Add a `data/appointments.json` file for offline appointment previews.
- Replace `formspree.io` placeholders with actual provider endpoints.

## Notes

- Existing admin pages (`admin/`) are not part of the static build.
- This static site preserves navigation, branding, and content structure while removing backend dependencies.
