# Audio Visualizer Pro

This project is a real-time audio visualizer built with React, TypeScript, and Tailwind CSS. You can upload an audio file, choose from various visualization styles, customize the appearance, and record the output as a video file.

## Features

-   **Multiple Visualization Styles**: Choose from styles like 'Monstercat', 'Tech Wave', 'Magic Circle', and more.
-   **Real-time Customization**: Adjust sensitivity, balance, smoothing, text, fonts, and colors on the fly.
-   **Audio Upload**: Supports drag-and-drop and file browsing for your audio tracks.
-   **Video Recording**: Record the canvas animation combined with the audio into a downloadable MP4/WebM file.
-   **Responsive Design**: Looks great on both desktop and mobile devices.

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
