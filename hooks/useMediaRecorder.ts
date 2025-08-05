import { useState, useRef, useCallback } from 'react';

// The callback now also provides the file extension
export const useMediaRecorder = (onRecordingComplete: (url: string, extension: string) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback((canvasElement: HTMLCanvasElement, audioStream: MediaStream) => {
        if (!canvasElement) return;

        // Define desired mime types and their corresponding extensions, MP4 is preferred
        const MimeTypeConfig = {
            mp4: {
                mimeType: 'video/mp4; codecs=avc1,mp4a',
                extension: 'mp4'
            },
            webm: {
                mimeType: 'video/webm; codecs=vp9,opus',
                extension: 'webm'
            },
            webm_fallback: {
                mimeType: 'video/webm',
                extension: 'webm'
            }
        };

        let selectedConfig;

        if (MediaRecorder.isTypeSupported(MimeTypeConfig.mp4.mimeType)) {
            selectedConfig = MimeTypeConfig.mp4;
        } else if (MediaRecorder.isTypeSupported(MimeTypeConfig.webm.mimeType)) {
            selectedConfig = MimeTypeConfig.webm;
        } else if (MediaRecorder.isTypeSupported(MimeTypeConfig.webm_fallback.mimeType)) {
            selectedConfig = MimeTypeConfig.webm_fallback;
        } else {
            alert("Your browser does not support MP4 or WEBM video recording. Please try a modern browser like Chrome or Firefox.");
            return;
        }
        
        const canvasStream = canvasElement.captureStream(30); // 30 fps
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        try {
            mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: selectedConfig.mimeType });
        } catch (e) {
            console.error("MediaRecorder instantiation error:", e);
            alert("An unexpected error occurred while starting the recorder.");
            return;
        }

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: selectedConfig.mimeType });
            const url = URL.createObjectURL(blob);
            onRecordingComplete(url, selectedConfig.extension);
            recordedChunksRef.current = [];
        };
        
        recordedChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);

    }, [onRecordingComplete]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    return { isRecording, startRecording, stopRecording };
};