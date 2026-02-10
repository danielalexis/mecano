# Mecano - Garage Management App

Mecano is a modern web application designed for garages and mechanics to manage vehicle service history, parts, and labor costs. Built with a mobile-first approach using Next.js, Tailwind CSS, and Firebase.

## Tech Stack

-   **Frontend:** Next.js (React) + TypeScript
-   **Styling:** Tailwind CSS + shadcn/ui (planned)
-   **Backend:** Firebase (Authentication + Firestore)
-   **State/Data:** React Query (planned) or simple Firestore hooks

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/mecano.git
    cd mecano
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Configure Firebase:**
    -   Create a project in the [Firebase Console](https://console.firebase.google.com/).
    -   Enable **Authentication** (Email/Password).
    -   Enable **Firestore Database**.
    -   Go to Project Settings and copy your web app's configuration.
    -   Create a `.env.local` file in the root directory (use `.env.local.example` as a template):
        ```bash
        cp .env.local.example .env.local
        ```
    -   Fill in your API keys in `.env.local`.

4.  **Run the development server:**
    ```bash
    pnpm dev
    # or
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `app/`: Next.js App Router pages and layouts.
-   `components/`: Reusable UI components.
-   `lib/`: Utility functions and Firebase configuration.
-   `types/`: TypeScript type definitions.

## Features (Planned)

-   Vehicle Management (CRUD)
-   Service Records & History
-   Parts & Labor Tracking
-   VAT Calculation
-   User Authentication