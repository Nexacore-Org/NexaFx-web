# Contributing to NexaFx

Thank you for your interest in contributing to **NexaFx**! 🚀 We welcome contributions from the community and appreciate your efforts to improve the project. Please follow the guidelines below to ensure a smooth collaboration.

---
### Important Note Before Applying 📝

⚠️ **Avoid Generic Comments:** Comments such as 🚫
"Can I help with this?" 🚫
"I’d love to contribute!" 🚫
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
   - Wait for the maintainer to assign the issue to you.
   - Remember to apply only if you can solve the issue.
   Again, In the comment, Add a quick introduction about yourself, The ETA, and how you plan to tackle the issue.




---

## Setting Up the Development Environment
### Prerequisites
Ensure you have the following installed:
- **Node.js** 
-  **npm**
- **Git**

### Fork and Clone the Repository
1. **Fork the repository** on GitHub.
2. Clone your fork to your local machine:
   ```sh
   git clone https://github.com/your-username/NexaFx-web.git
   cd Nexafx-web
   ```
3. Add the upstream repository:
   ```sh
   git remote add upstream https://github.com/Nexacore-Org/Nexafx-web.git
   ```

### Install Dependencies
 using npm:
```sh
npm install
```

### Start the Development Server
```sh
npm run dev
```
The platform should now be running at `http://localhost:3000/`.

---

## Opening Issues and Pull Requests
### Issues
- **Check existing issues** before opening a new one to avoid duplicates.
- **Describe the problem clearly**, including steps to reproduce if it's a bug.
- **Label the issue appropriately** (e.g., bug, enhancement, documentation).

### Pull Requests
- **Follow the coding standards** outlined below.
- **Reference related issues** in the PR description.
- **Ensure your code is well-tested** before submitting.
- **Keep pull requests focused** on a single change or feature.
- **Use a descriptive title** and provide necessary context.

---

## Coding Standards & Best Practices
- Follow the **Airbnb JavaScript Style Guide**.
- Use **Prettier** for code formatting.
- Write **meaningful variable and function names**.
- Use **TypeScript** for type safety.
- Keep components **modular and reusable**.
- Document functions and components where necessary.

---

## Branching Strategy & Commit Message Format
### Branching Strategy
- **main**: Stable, production-ready code.
- **dev**: Latest development changes.
- **feature/xyz**: New features.
- **bugfix/xyz**: Bug fixes.

### Commit Message Format
Use the following format for commit messages:
```sh
[type]: [short description]
```
Examples:
```sh
feat: add user authentication flow
fix: resolve issue with quiz scoring
chore: update dependencies
```

---

## Testing & Debugging Instructions
- Run **unit tests** before submitting a PR:
  ```sh
  npm run test
  ```
- Check the browser console for **runtime errors**.
- Use **Redux DevTools** or **React Developer Tools** for state debugging.
- Ensure **API requests** return expected results before making changes.

---

## Need Help?
If you have any questions, feel free to ask in our **telegram community** [https://t.me/Nexafx](https://t.me/+WkWO3kNnA-1mYzVk).

Thank you for contributing! 
