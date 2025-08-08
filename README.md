# Audio Visualizer Pro

This project is a real-time audio visualizer built with React, TypeScript, and Tailwind CSS. You can upload an audio file, choose from various visualization styles, customize the appearance, and record the output as a video file.

## Features

-   **Multiple Visualization Styles**: Choose from styles like 'Monstercat', 'Luminous Wave', 'Fusion', and more.
-   **Real-time Customization**: Adjust sensitivity, balance, smoothing, text, fonts, and colors on the fly.
-   **Audio Upload**: Supports drag-and-drop and file browsing for your audio tracks.
-   **Video Recording**: Record the canvas animation combined with the audio into a downloadable MP4/WebM file.
-   **Responsive Design**: Looks great on both desktop and mobile devices.

## Running Locally / Development Setup

Before loading as an extension, you can run this project on your own computer for development and testing.

### Prerequisites

Make sure you have the following software installed on your machine:

-   **[Node.js](https://nodejs.org/)**: LTS (Long-Term Support) version is recommended. `npm` (Node Package Manager) is included with the installation.
-   **[Git](https://git-scm.com/)**: For cloning the repository from GitHub.

### Step-by-Step Guide

1.  **Clone the repository:**
    Open your terminal or command prompt and run the following command to download the project files:
    ```bash
    git clone https://github.com/techtrekleo/audio-visualizer.git
    ```

2.  **Navigate into the project directory:**
    ```bash
    cd audio-visualizer-pro
    ```

3.  **Install dependencies:**
    This command reads the `package.json` file and downloads all the necessary libraries (like React, Vite, etc.) for the project to run.
    ```bash
    npm install
    ```

4.  **Run the development server:**
    This will start a local server, and you'll see a URL in the terminal.
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Open your web browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173`). You should now see the application running!

## How to Load as a Chrome Extension

This project is configured to run as a Google Chrome extension. Follow these steps to load it for testing.

1.  **Open Chrome Extensions Page:**
    Navigate to `chrome://extensions` in your Chrome browser.

2.  **Enable Developer Mode:**
    In the top-right corner of the Extensions page, toggle the "Developer mode" switch to the "on" position.

3.  **Load the Extension:**
    Three new buttons will appear. Click on the **"Load unpacked"** button.

4.  **Select Project Folder:**
    A file selection dialog will open. Navigate to and select the root directory of this project (the `audio-visualizer-pro` folder).

5.  **Done!**
    The "Audio Visualizer Pro" extension will now appear in your list of extensions. You can find its icon in the Chrome toolbar (you might need to click the puzzle piece icon to pin it). Click the icon to open the visualizer in a new tab!
