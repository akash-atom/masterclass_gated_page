# @aw-webflow/masterclass_gated_page

## Overview

Gated video lightbox for the Atomicwork Masterclass page (`/agentic-itsm-masterclass`). Gates Vimeo video playback behind a name + work email form. Published to npm as `@aw-webflow/masterclass_gated_page` and consumed via jsDelivr CDN.

## How It Works

1. User clicks a video thumbnail (`[data-vimeo-url]`) or a CTA button (`#cta-1` to `#cta-4`)
2. If first time: shows a gated form (name + work email) in a lightbox modal
3. On submit: stores user in `localStorage`, sends data to HubSpot Forms API, shows Vimeo video
4. Subsequent clicks: skips the form, plays video directly
5. Free email providers (Gmail, Yahoo, Hotmail, etc.) are blocked — work email only

## Webflow Setup

- Video elements need `data-vimeo-url="https://vimeo.com/..."` attribute and IDs `#vid-1` through `#vid-4`
- CTA buttons need IDs `#cta-1` through `#cta-4` — clicks are mirrored to the corresponding `#vid-N`

## HubSpot Integration

- Portal ID: `22680279`
- Form ID: `83223ac9-61aa-47a8-a3d7-9fcc2c275d7a`
- Fields sent: `firstname`, `lastname` (split from full name), `email`
- Currently fire-and-forget (doesn't block video playback)

## Theme

Styled to match the Atomicwork masterclass page:
- Warm gradient modal background (`#fff` → `#ffe8cf`)
- Gradient heading text (`#171717` → `#341dd1` → `#7c3aed`)
- Gradient submit button (`#080231` → `#341dd1` → `#a872ff`)
- Inter font family, 8px border radius

## Code Style

- All code must use `var` and ES5 syntax for maximum browser compatibility.
- No ES6+ features (arrow functions, let/const, template literals, etc.).

## Deployment

1. Push changes to GitHub
2. Bump version in `package.json`
3. Run `npm publish --access public`
4. jsDelivr automatically serves the updated package
