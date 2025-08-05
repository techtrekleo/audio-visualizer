import React, { useState, useRef, useCallback } from 'react';
import AudioUploader from './components/AudioUploader';
import AudioVisualizer from './components/AudioVisualizer';
import Controls from './components/Controls';
import Icon from './components/Icon';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { VisualizationType, FontType } from './types';
import { ICON_PATHS } from './constants';

function App() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoExtension, setVideoExtension] = useState<string>('webm');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [visualizationType, setVisualizationType] = useState<VisualizationType>(VisualizationType.MONSTERCAT);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [customText, setCustomText] = useState<string>('口袋裡有貓');
    const [textColor, setTextColor] = useState<string>('#67E8F9');
    const [fontFamily, setFontFamily] = useState<FontType>(FontType.POPPINS);
    const [sensitivity, setSensitivity] = useState<number>(1.0);
    const [smoothing, setSmoothing] = useState<number>(0);
    const [equalization, setEqualization] = useState<number>(0.25);

    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleRecordingComplete = useCallback((url: string, extension: string) => {
        setVideoUrl(url);
        setVideoExtension(extension);
        setIsLoading(false);
    }, []);

    const { analyser, initializeAudio, isAudioInitialized, getAudioStream } = useAudioAnalysis();
    const { isRecording, startRecording, stopRecording } = useMediaRecorder(handleRecordingComplete);

    const handleFileSelect = (file: File) => {
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
    };

    const handlePlayPause = useCallback(() => {
        if (!audioRef.current) return;

        if (!isAudioInitialized) {
            initializeAudio(audioRef.current);
        }

        const newIsPlaying = !isPlaying;
        if (newIsPlaying) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioRef.current.pause();
        }
        setIsPlaying(newIsPlaying);
    }, [isPlaying, isAudioInitialized, initializeAudio]);

    const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.ended) {
            setIsPlaying(false);
            if (isRecording) {
                stopRecording();
            }
        }
    };

    const handleStartRecording = () => {
        if (isRecording) {
            stopRecording();
            setIsLoading(true);
        } else {
            const audioStream = getAudioStream();
            if (canvasRef.current && audioStream && audioRef.current) {
                startRecording(canvasRef.current, audioStream);
                audioRef.current.currentTime = 0;
                audioRef.current.play().then(() => setIsPlaying(true));
            } else {
                 alert("Could not start recording. Please ensure audio is loaded and ready.");
            }
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-100">
            <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                crossOrigin="anonymous"
            />
            
            <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 border-b border-gray-700 mb-4">
                <div className="flex items-center space-x-3">
                    <Icon path={ICON_PATHS.MUSIC_NOTE} className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold tracking-wider">Audio Visualizer Pro</h1>
                </div>
            </header>

            <main className="w-full flex-grow flex flex-col items-center justify-center">
                {!audioFile ? (
                    <AudioUploader onFileSelect={handleFileSelect} />
                ) : (
                    <div className="w-full max-w-7xl flex flex-col items-center space-y-4">
                        <div className="relative w-full aspect-video bg-black rounded-lg shadow-2xl shadow-cyan-500/10 overflow-hidden border border-gray-700">
                           <AudioVisualizer 
                                ref={canvasRef}
                                analyser={analyser} 
                                visualizationType={visualizationType} 
                                isPlaying={isPlaying}
                                customText={customText}
                                textColor={textColor}
                                fontFamily={fontFamily}
                                sensitivity={sensitivity}
                                smoothing={smoothing}
                                equalization={equalization}
                            />
                        </div>
                        <Controls
                            isPlaying={isPlaying}
                            onPlayPause={handlePlayPause}
                            isRecording={isRecording}
                            onRecordToggle={handleStartRecording}
                            isLoading={isLoading}
                            visualizationType={visualizationType}
                            onVisualizationChange={setVisualizationType}
                            customText={customText}
                            onTextChange={setCustomText}
                            textColor={textColor}
                            onTextColorChange={setTextColor}
                            fontFamily={fontFamily}
                            onFontFamilyChange={setFontFamily}
                            sensitivity={sensitivity}
                            onSensitivityChange={setSensitivity}
                            smoothing={smoothing}
                            onSmoothingChange={setSmoothing}
                            equalization={equalization}
                            onEqualizationChange={setEqualization}
                            audioFile={audioFile}
                            videoUrl={videoUrl}
                            videoExtension={videoExtension}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;