# Contributing to ByteChain Academy

Thank you for your interest in contributing to **ByteChain Academy**! 🚀 We welcome contributions from the community and appreciate your efforts to improve the project. Please follow the guidelines below to ensure a smooth collaboration.

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
   git clone https://github.com/your-username/ByteChain-Academy.git
   cd ByteChain-Academy
   ```
3. Add the upstream repository:
   ```sh
   git remote add upstream https://github.com/official-repo/ByteChain-Academy.git
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
If you have any questions, feel free to ask in our **telegram community**.

Thank you for contributing! 
