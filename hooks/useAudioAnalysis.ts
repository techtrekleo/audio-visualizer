import { useState, useRef, useCallback } from 'react';

export const useAudioAnalysis = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const audioDurationRef = useRef<number>(0);

    const initializeAudio = useCallback((audioElement: HTMLAudioElement) => {
        // Guard against re-initialization on the same audio setup
        if (isInitialized || !audioElement) return;

        // Creating a new context ensures a clean slate, preventing errors from
        // re-using a context that might be in a suspended or closed state.
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        // 動態設定FFT大小，根據音頻長度優化
        const audioDuration = audioElement.duration || 0;
        audioDurationRef.current = audioDuration;
        
        // 根據音頻長度動態調整FFT大小
        let optimalFftSize = 2048; // 默認值
        if (audioDuration > 0) {
            if (audioDuration < 30) {
                // 短音頻：使用較小的FFT大小，提高時間分辨率
                optimalFftSize = 1024;
            } else if (audioDuration > 300) {
                // 長音頻：使用較大的FFT大小，提高頻率分辨率
                optimalFftSize = 4096;
            }
            // 30-300秒的音頻使用默認2048
        }

        // This can throw an InvalidStateError if the HTMLMediaElement is already connected
        // to a source node from a previous AudioContext that wasn't fully torn down.
        // The robust `resetAudioAnalysis` function is designed to prevent this.
        sourceRef.current = context.createMediaElementSource(audioElement);
        
        const analyser = context.createAnalyser();
        analyser.fftSize = optimalFftSize;
        analyser.smoothingTimeConstant = 0.8; // 添加平滑設定
        analyserRef.current = analyser;

        const destinationNode = context.createMediaStreamDestination();
        destinationNodeRef.current = destinationNode;

        // Connect the audio graph
        sourceRef.current.connect(analyser);
        analyser.connect(context.destination); // Play through speakers
        analyser.connect(destinationNode); // Send to stream for recording
        
        console.log(`Audio initialized with FFT size: ${optimalFftSize}, Sample rate: ${context.sampleRate}Hz, Duration: ${audioDuration}s`);
        
        setIsInitialized(true);
    }, [isInitialized]);

    const resetAudioAnalysis = useCallback(() => {
        // Explicitly disconnect all nodes before closing the context. This is the
        // most robust way to prevent an 'InvalidStateError' when a new audio
        // file is loaded and a new audio graph needs to be created.
        if (sourceRef.current) {
            sourceRef.current.disconnect();
        }
        if (analyserRef.current) {
            analyserRef.current.disconnect();
        }

        // Close the existing AudioContext if it exists.
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }

        // Nullify refs to ensure they are re-created cleanly
        audioContextRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
        destinationNodeRef.current = null;
        audioDurationRef.current = 0;
        // Allow re-initialization
        setIsInitialized(false);
    }, []);

    const getAudioStream = useCallback(() => {
        return destinationNodeRef.current?.stream ?? null;
    }, []);

    const getAudioInfo = useCallback(() => {
        if (!audioContextRef.current || !analyserRef.current) return null;
        
        return {
            sampleRate: audioContextRef.current.sampleRate,
            fftSize: analyserRef.current.fftSize,
            frequencyBinCount: analyserRef.current.frequencyBinCount,
            duration: audioDurationRef.current,
            contextState: audioContextRef.current.state
        };
    }, []);

    return {
        analyser: analyserRef.current,
        initializeAudio,
        isAudioInitialized: isInitialized,
        getAudioStream,
        resetAudioAnalysis,
        getAudioInfo,
    };
};