# Expense Tracker

A modern Expense Tracker application built with React, Firebase, and Material UI. This application allows users to track their expenses, categorize them, analyze spending habits with charts, and manage their budget effectively.

## Features

- **User Authentication**: Secure login and registration using Firebase Authentication.
- **Expense Management**: Add, edit, and delete expenses with ease.
- **Categorization**: Organize expenses into custom categories.
- **Analysis Dashboard**: Visualize spending trends with interactive charts (Monthly Trends & Category Breakdown).
- **Filtering**: Filter expenses by date range, category, and amount.
- **Responsive Design**: Fully responsive layout that works seamlessly on desktop and mobile devices.
- **Dark/Light Mode**: Toggle between dark and light themes for better accessibility.

## Tech Stack

- **Frontend**: React.js, Material UI (MUI)
- **Backend**: Firebase (Firestore Database, Authentication)
- **Charting**: Recharts
- **Routing**: React Router DOM

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expensify
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project (e.g., "Expense Tracker").
3.  Enable **Authentication**:
    *   Go to "Authentication" > "Sign-in method".
    *   Enable "Email/Password".
4.  Enable **Firestore Database**:
    *   Go to "Firestore Database" > "Create database".
    *   Start in **Test mode** (for development) or **Production mode** (configure rules appropriately).
5.  Register your app:
    *   Go to Project Settings > General.
    *   Click on the web icon (`</>`) to add a web app.
    *   Copy the `firebaseConfig` object.

### 4. Environment Variables

Create a `.env` file in the root directory of your project and add your Firebase configuration details. You can use the provided `.env.example` as a template (if available), or simply add the following:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

> **Note**: Ensure you restart the development server after creating or modifying the `.env` file.

### 5. Run the Application

Start the development server:

```bash
npm start
```

The application will launch in your default browser at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate a `build` folder containing the optimized static files ready for deployment.

## License

This project is licensed under the MIT License.
