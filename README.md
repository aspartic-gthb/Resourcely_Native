# Resourcely (React Native Edition)

Welcome to **Resourcely**, your ultimate student companion app! This application has been modernized and rebuilt using **React Native** and **Expo**, migrating from its original Kotlin roots. It is designed to help students efficiently manage their academic lives with a seamless, cross-platform experience.

## 🚀 Features

- **Resource Management**: Easily store, categorize, and find links and documents relevant to your studies.
- **Task Tracker**: Keep on top of your assignments and daily to-dos.
- **Timetable/Schedule**: Manage your classes and never miss a lecture.
- **Pomodoro Timer**: Boost your productivity using the built-in Pomodoro technique timer.
- **Attendance Tracker**: Keep an eye on your attendance percentages to ensure you meet requirements.
- **Cloud Sync**: Securely powered by **Firebase Authentication** and **Firestore** for real-time cloud synchronization, ensuring your data is accessible wherever you are.
- **Theming**: Enjoy a beautifully crafted UI with support for Light and Dark modes.

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Drawer & Stack)
- **Backend & Database**: Firebase (Auth, Firestore)
- **Animations**: React Native Reanimated
- **Icons**: Expo Vector Icons

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation

1. **Clone the repository** (or download the source):.
   ```bash
   git clone <YOUR_REPO_URL>
   cd ResourcelyNative
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

## 📱 Running the App

Once the development server is running, you can open the app in a few different ways:
- **Development Build**: Ideal for local testing with custom native modules.
- **Android Emulator / iOS Simulator**: Run locally on your computer.
- **Expo Go**: Scan the QR code from the terminal using the Expo Go app on your physical device.

## 🧠 Architecture Highlights

- **`src/config/`**: Contains Firebase initialization and setup.
- **`src/context/`**: Houses React Context providers for global state management (Authentication, Theme).
- **`src/database/`**: Contains helper functions for interacting with Firestore.
- **`src/screens/`**: All the UI screens for the application (Home, Tasks, Pomodoro, etc.).
- **`src/theme/`**: Manages the design system, colors, and theming logic.

## 🤝 Contributing

Feel free to open issues or submit pull requests if you have ideas on how to improve Resourcely!

---
*Stay organized, stay productive, and ace your studies with Resourcely!*
