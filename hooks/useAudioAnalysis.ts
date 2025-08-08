
import { useState, useRef, useCallback } from 'react';

export const useAudioAnalysis = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const initializeAudio = useCallback((audioElement: HTMLAudioElement) => {
        // Guard against re-initialization on the same audio setup
        if (isInitialized || !audioElement) return;

        // Creating a new context ensures a clean slate, preventing errors from
        // re-using a context that might be in a suspended or closed state.
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        // This will throw an error if a source node already exists for this element
        // within this context. Since we create a new context, it's always safe.
        sourceRef.current = context.createMediaElementSource(audioElement);
        
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const destinationNode = context.createMediaStreamDestination();
        destinationNodeRef.current = destinationNode;

        // Connect the audio graph
        sourceRef.current.connect(analyser);
        analyser.connect(context.destination); // Play through speakers
        analyser.connect(destinationNode); // Send to stream for recording
        
        setIsInitialized(true);
    }, [isInitialized]);

    const resetAudioAnalysis = useCallback(() => {
        // Close the existing AudioContext if it exists.
        // This is the most reliable way to tear down the entire audio graph.
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        // Nullify refs to ensure they are re-created cleanly
        audioContextRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
        destinationNodeRef.current = null;
        // Allow re-initialization
        setIsInitialized(false);
    }, []);


    const getAudioStream = useCallback(() => {
        return destinationNodeRef.current?.stream ?? null;
    }, []);

    return {
        analyser: analyserRef.current,
        initializeAudio,
        isAudioInitialized: isInitialized,
        getAudioStream,
        resetAudioAnalysis,
    };
};