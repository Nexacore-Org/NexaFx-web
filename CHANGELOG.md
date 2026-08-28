# Changelog

All notable changes to NexaFx are documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses semantic versioning where release versions are assigned.

## [Unreleased]

### Added

- Resilient async boundaries and loading states for authentication and dashboard flows.
- Expanded notification, transaction, deposit, withdrawal, and admin workflow coverage.

### Changed

- Improved form validation, sanitization, keyboard navigation, and mobile navigation behavior.
- Improved dashboard balance and market-rate resilience.

### Fixed

- Added missing authentication middleware redirects and route protection.
- Fixed missing viewport metadata and handled null user names in admin displays.

## Updating This File

Contributors should add a concise entry under `Unreleased` in the same pull request as any user-visible change, behavior change, bug fix, or contributor-facing change. During a release, move those entries into a dated version section, then start a fresh `Unreleased` section.