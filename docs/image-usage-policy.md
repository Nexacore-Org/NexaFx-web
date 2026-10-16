# Image Usage Policy

## Overview

This document describes how images are loaded and used in the NexaFx web app.

## next/image Configuration

All remote images must be loaded via the `next/image` component and must match the `remotePatterns` configured in `next.config.ts`:

- `https://**.nexacore.org` — first-party CDN assets (avatars, KYC documents, transaction receipts).
- `https://images.unsplash.com` — licensed stock imagery for marketing pages.

Any additional remote image host must be added to `remotePatterns` before use.

## Rules

1. Always use `next/image` (never raw `<img>`) for remote images.
2. Provide meaningful `alt` text; use `alt=""` only for decorative images.
3. Set explicit `width` and `height` (or use `fill` with a sized parent) to prevent layout shift.
4. Do not reference image hosts outside `remotePatterns`; the app will throw at runtime.
5. Prefer first-party CDN assets over external hosts for anything user-facing.

## Adding a New Host

1. Add the pattern to `images.remotePatterns` in `next.config.ts`.
2. Document the host in this file and the rationale for allowing it.
