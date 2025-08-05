# Audio Visualizer Pro

This project is a real-time audio visualizer built with React, TypeScript, and Tailwind CSS. You can upload an audio file, choose from various visualization styles, customize the appearance, and record the output as a video file.

## Features

-   **Multiple Visualization Styles**: Choose from styles like 'Monstercat', 'Tech Wave', 'Magic Circle', and more.
-   **Real-time Customization**: Adjust sensitivity, balance, smoothing, text, fonts, and colors on the fly.
-   **Audio Upload**: Supports drag-and-drop and file browsing for your audio tracks.
-   **Video Recording**: Record the canvas animation combined with the audio into a downloadable MP4/WebM file.
-   **Responsive Design**: Looks great on both desktop and mobile devices.

## Running Locally / Development Setup

Before deploying, you can run this project on your own computer for development and testing.

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

## How to Deploy to Railway

Deploying this application is straightforward with [Railway](https://railway.app/).

1.  **Fork/Clone to Your GitHub:**
    Get this repository into your own GitHub account.

2.  **Create a New Project on Railway:**
    -   Log in to your Railway account.
    -   Click on "New Project".
    -   Select "Deploy from GitHub repo" and choose the repository you just created.

3.  **Automatic Deployment:**
    -   Railway will automatically detect the `Dockerfile` in the repository.
    -   It will then build the Docker image and deploy the application.
    -   No environment variables are needed for this project.

4.  **Done!**
    -   Once the deployment is complete, Railway will provide you with a public URL where you can access your live audio visualizer.