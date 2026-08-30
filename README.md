# Sidhu Builds

Static business website and portfolio for Sidhu Builds, designed for deployment at `https://sidhu-builds.github.io/` through GitHub Pages.

## What is included

- Five focused service offerings
- The **Minimal** case study with live-project and repository links
- An accessible, keyboard-friendly interactive project process
- A responsive project inquiry form with client-side validation
- Honest fallback contact through the public Sidhu Builds GitHub profile
- No external packages, frameworks, fonts, images, analytics, or trackers

## Local preview

Open `index.html` directly, or run a local static server from this directory:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages deployment

Place these files at the root of the `sidhu-builds/sidhu-builds.github.io` repository and publish from the `main` branch root in **Settings → Pages**.

## Before enabling direct inquiries

The form intentionally does not submit anywhere yet. Once the business email, phone number, and preferred form service or backend are confirmed:

1. Connect the form to the chosen endpoint.
2. Replace the current review-only notice with accurate success and failure states.
3. Add the verified public email and phone number to the contact section.
4. Test delivery, spam handling, and the mobile experience before advertising the form.

Do not place private credentials or API keys in this static repository.
