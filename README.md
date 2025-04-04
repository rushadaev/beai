# BeAI - AI Agent Generator

BeAI is a platform for creating custom AI agents that can be embedded into websites or Telegram bots. The platform allows users to create, customize, and deploy AI chatbots with minimal setup.

## Current Features

- **User Authentication**: 
  - Register and login with email/password via Firebase
  - Sign in with Google
- **Modern UI**: Clean, responsive design built with Next.js and TailwindCSS
- **Dashboard**: Basic user dashboard to manage AI agents (work in progress)
- **Firebase Integration**: Authentication and hosting ready to go

## Getting Started

### Prerequisites

- Node.js 22 or later
- npm (comes with Node.js)
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd beai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the development server
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Firebase Setup

The project is already configured with Firebase for authentication. The Firebase configuration is in `src/lib/firebase/config.js`.

To deploy the application to Firebase Hosting:

1. Install Firebase CLI
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase
   ```
   firebase login
   ```

3. Initialize Firebase in your project
   ```
   firebase init
   ```
   - Select Hosting
   - Choose your Firebase project
   - Set the public directory to `out`
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys with GitHub: No (unless you want to)

4. Build for production
   ```
   npm run build
   ```

5. Export the Next.js app to static files
   ```
   next export
   ```

6. Deploy to Firebase
   ```
   firebase deploy
   ```

## Project Structure

- `src/app/` - Next.js app directory for pages and routing
- `src/lib/` - Utility functions, contexts, and Firebase configuration
- `src/components/` - Reusable React components (to be added)
- `public/` - Static assets

## Roadmap

1. ✅ Create landing page
2. ✅ Implement authentication
3. ✅ Create user dashboard
4. 🔄 Implement AI agent creation interface
5. 🔄 Add customization options for AI agents
6. 🔄 Deploy to Firebase hosting
7. 🔄 Add website embedding code
8. 🔄 Implement Telegram bot integration

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Authentication, Hosting)
- [TypeScript](https://www.typescriptlang.org/)
