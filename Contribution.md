# Contributing to NexaFx

Thank you for your interest in contributing to **NexaFx**! 🚀 We welcome contributions from the community and appreciate your efforts to improve the project. Please follow the guidelines below to ensure a smooth collaboration.

---
### Important Note Before Applying 📝

⚠️ **Avoid Generic Comments:** Comments such as 🚫
"Can I help with this?" 🚫
"I'd love to contribute!" 🚫
"Check out my profile!" or 🚫
"Can I work on this?"... these will not be considered.

Instead, provide a **clear explanation of your approach**, which includes:

- A brief introduction about yourself.
- A concise plan outlining how you will address the issue (3–6 lines max).
- Your estimated completion time (ETA).

---

How to Contribute🤝

## Pull Request Template

To ensure consistency and improve the review process, we've implemented a PR template. When creating a pull request, please:

1. Follow the PR template that automatically loads when you create a new PR.

2. Fill out all relevant sections of the template.

3. Ensure your PR description clearly communicates the changes you've made.

4. Include screenshots or recordings when applicable.

5. Link to any related issues using keywords like "Closes #123" or "Fixes #123"

The template location is at [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) and provides a structured format to help maintainers understand and review your contribution more efficiently.

---

## Steps to apply

Apply for an Issue
   - Look for an open issue and comment expressing your interest in working on it.
---

## Steps to apply

- Look for an open issue and comment with your approach, as described above.
- Wait for the maintainer to assign the issue to you before starting.
- Only apply if you can solve the issue.

---

## Development setup

Prerequisites: Node.js 22+, npm and Git.

```sh
git clone https://github.com/<your-username>/NexaFx-web.git
cd NexaFx-web
git remote add upstream https://github.com/Nexacore-Org/NexaFx-web.git
git checkout v2
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Branches

- `v2` is the working branch for the rebuild. Branch from `v2` and open your PR into `v2`.
- `main` is production. `v1` is the previous codebase.
- `archive/v2-2026-10` is a read-only snapshot of v2 before the October 2026 reset.

## Before you push

Run the same checks CI runs:

```sh
npm run verify
```

This runs lint, type-check and the production build. A PR is reviewed only when CI is green.
