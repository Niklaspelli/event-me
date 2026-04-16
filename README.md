# Event-Me 🕺

Event-Me is a real-time social event discovery and sharing platform built with React, Firebase, and Meta's Facebook Login. It allows users to find, create, and interact with local events through a live feed.

## 🚀 Features

- **Facebook Authentication:** Secure login using Meta for Developers and Firebase Auth.
- **Event Management:** Create and publish events with titles and descriptions.
- **Real-time Feed:** A live stream of events and posts using Firestore's `onSnapshot`.
- **Social Interactions:** Like posts and reply to messages with nested comments.
- **Responsive UI:** Built with React Bootstrap for a clean, mobile-friendly experience.
- **Type Safety:** Fully written in TypeScript with dedicated interfaces for data models.

## 🛠 Tech Stack

- **Frontend:** React (Vite), TypeScript
- **Styling:** React Bootstrap
- **Backend-as-a-Service:** Firebase
  - **Authentication:** Facebook OAuth
  - **Database:** Cloud Firestore
- **State Management:** React Context API & Custom Hooks

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or later) installed.
- A Firebase project set up.
- A Meta for Developers App ID and App Secret.

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/event-me.git](https://github.com/your-username/event-me.git)
   cd event-me
   ```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
