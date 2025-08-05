
import { useState, useRef, useCallback } from 'react';

export const useAudioAnalysis = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const initializeAudio = useCallback((audioElement: HTMLAudioElement) => {
        if (isInitialized || !audioElement || audioContextRef.current) return;

        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        if (!sourceRef.current) {
            sourceRef.current = context.createMediaElementSource(audioElement);
        }
        
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const destinationNode = context.createMediaStreamDestination();
        destinationNodeRef.current = destinationNode;

        sourceRef.current.connect(analyser);
        analyser.connect(context.destination); // Play through speakers
        analyser.connect(destinationNode); // Send to stream for recording
        
        setIsInitialized(true);
    }, [isInitialized]);

    const getAudioStream = useCallback(() => {
        return destinationNodeRef.current?.stream ?? null;
    }, []);

    return {
        analyser: analyserRef.current,
        initializeAudio,
        isAudioInitialized: isInitialized,
        getAudioStream,
    };
};
