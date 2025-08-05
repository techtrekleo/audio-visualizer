
import React, { useState, useRef, useCallback } from 'react';
import AudioUploader from './components/AudioUploader';
import AudioVisualizer from './components/AudioVisualizer';
import Controls from './components/Controls';
import Icon from './components/Icon';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Palette, Resolution } from './types';
import { ICON_PATHS, COLOR_PALETTES, RESOLUTION_MAP } from './constants';

function App() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoExtension, setVideoExtension] = useState<string>('webm');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [visualizationType, setVisualizationType] = useState<VisualizationType>(VisualizationType.FUSION);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [customText, setCustomText] = useState<string>('口袋裡有貓');
    const [textColor, setTextColor] = useState<string>('#67E8F9');
    const [fontFamily, setFontFamily] = useState<FontType>(FontType.POPPINS);
    const [sensitivity, setSensitivity] = useState<number>(1.0);
    const [smoothing, setSmoothing] = useState<number>(0);
    const [equalization, setEqualization] = useState<number>(0.25);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [backgroundColor, setBackgroundColor] = useState<BackgroundColorType>(BackgroundColorType.BLACK);
    const [colorPalette, setColorPalette] = useState<ColorPaletteType>(ColorPaletteType.DEFAULT);
    const [resolution, setResolution] = useState<Resolution>(Resolution.P1080);

    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const canvasBgColors: Record<BackgroundColorType, string> = {
        [BackgroundColorType.BLACK]: 'rgba(0, 0, 0, 1)',
        [BackgroundColorType.GREEN]: 'rgba(0, 255, 0, 1)',
    };


    const handleRecordingComplete = useCallback((url: string, extension: string) => {
        setVideoUrl(url);
        setVideoExtension(extension);
        setIsLoading(false);
        setShowWarning(false);
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
                setShowWarning(true);
                startRecording(canvasRef.current, audioStream);
                audioRef.current.currentTime = 0;
                audioRef.current.play().then(() => setIsPlaying(true));
            } else {
                 alert("Could not start recording. Please ensure audio is loaded and ready.");
            }
        }
    };
    
    const resValue = RESOLUTION_MAP[resolution];
    const visualizerContainerStyle = {
        width: resValue ? `${resValue.width}px` : '100%',
        height: resValue ? `${resValue.height}px` : '100%',
        maxHeight: '75vh',
        maxWidth: '100%',
        flexShrink: 0,
    };
    const wrapperStyle = resValue ? { height: '75vh', width: '100%'} : { width: '100%', aspectRatio: '16/9' };


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
                         <div style={wrapperStyle} className="flex items-center justify-center bg-black rounded-lg border border-gray-700 overflow-auto">
                            <div style={visualizerContainerStyle} className="relative shadow-2xl shadow-cyan-500/10">
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
                                    backgroundColor={canvasBgColors[backgroundColor]}
                                    colors={COLOR_PALETTES[colorPalette]}
                                />
                            </div>
                        </div>

                        {showWarning && (
                            <div 
                                className="w-full max-w-7xl p-3 bg-yellow-500/10 border border-yellow-400 text-yellow-200 rounded-lg text-center shadow-lg flex items-center justify-center gap-3"
                                role="alert"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-400 flex-shrink-0"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.74c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>
                                <p><strong>錄製中...</strong> 為了確保影片完整，請將此分頁保持在前景顯示。高解析度錄製可能會導致介面回應緩慢。</p>
                            </div>
                        )}

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
                            backgroundColor={backgroundColor}
                            onBackgroundColorChange={setBackgroundColor}
                            colorPalette={colorPalette}
                            onColorPaletteChange={setColorPalette}
                            resolution={resolution}
                            onResolutionChange={setResolution}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
