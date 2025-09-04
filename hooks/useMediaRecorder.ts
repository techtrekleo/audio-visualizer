
import { useState, useRef, useCallback } from 'react';

// The callback now also provides the file extension
export const useMediaRecorder = (onRecordingComplete: (url: string, extension: string) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<number>(0);
    const audioInfoRef = useRef<any>(null);

    const startRecording = useCallback((canvasElement: HTMLCanvasElement, audioStream: MediaStream, isTransparent: boolean = false, audioInfo?: any) => {
        if (!canvasElement) return;

        // 保存音頻信息用於調試
        audioInfoRef.current = audioInfo;

        const webmTransparentOptions = { mimeType: 'video/webm; codecs=vp9,opus', extension: 'webm' };
        const webmFallbackOptions = { mimeType: 'video/webm', extension: 'webm' };
        const mp4Options = { mimeType: 'video/mp4; codecs=avc1,mp4a', extension: 'mp4' };

        let selectedConfig;

        if (isTransparent) {
            // For transparency, WEBM is the only real choice. Prefer VP9 for better quality/alpha support.
            if (MediaRecorder.isTypeSupported(webmTransparentOptions.mimeType)) {
                selectedConfig = webmTransparentOptions;
            } else if (MediaRecorder.isTypeSupported(webmFallbackOptions.mimeType)) {
                selectedConfig = webmFallbackOptions;
            } else {
                alert("Your browser does not support recording with a transparent background. Please try a modern browser like Chrome or Firefox.");
                return;
            }
        } else {
            // For opaque backgrounds, prefer MP4 for better compatibility with video editors.
            if (MediaRecorder.isTypeSupported(mp4Options.mimeType)) {
                selectedConfig = mp4Options;
            } else if (MediaRecorder.isTypeSupported(webmTransparentOptions.mimeType)) {
                selectedConfig = webmTransparentOptions;
            } else if (MediaRecorder.isTypeSupported(webmFallbackOptions.mimeType)) {
                selectedConfig = webmFallbackOptions;
            } else {
                alert("Your browser does not support MP4 or WEBM video recording.");
                return;
            }
        }
        
        // 根據音頻信息動態調整幀率
        let optimalFps = 60;
        if (audioInfo && audioInfo.duration) {
            if (audioInfo.duration < 30) {
                // 短音頻：使用較高幀率確保流暢
                optimalFps = 60;
            } else if (audioInfo.duration > 300) {
                // 長音頻：使用較低幀率節省資源
                optimalFps = 30;
            }
        }
        
        // 使用動態幀率來確保時間同步
        const canvasStream = canvasElement.captureStream(optimalFps);
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // 動態調整比特率
        let videoBitsPerSecond = 8000000; // 8 Mbps
        if (audioInfo && audioInfo.duration) {
            if (audioInfo.duration < 30) {
                videoBitsPerSecond = 12000000; // 12 Mbps for short videos
            } else if (audioInfo.duration > 300) {
                videoBitsPerSecond = 6000000; // 6 Mbps for long videos
            }
        }

        try {
            mediaRecorderRef.current = new MediaRecorder(combinedStream, { 
                mimeType: selectedConfig.mimeType,
                videoBitsPerSecond: videoBitsPerSecond
            });
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

        // 記錄開始時間
        recordingStartTimeRef.current = Date.now();
        
        // 根據音頻長度動態調整數據收集頻率
        let timeslice = 1000; // 默認每秒收集一次
        if (audioInfo && audioInfo.duration) {
            if (audioInfo.duration < 30) {
                timeslice = 500; // 短音頻：每0.5秒收集一次
            } else if (audioInfo.duration > 300) {
                timeslice = 2000; // 長音頻：每2秒收集一次
            }
        }
        
        recordedChunksRef.current = [];
        mediaRecorderRef.current.start(timeslice);
        setIsRecording(true);

        console.log(`Recording started with FPS: ${optimalFps}, Bitrate: ${videoBitsPerSecond/1000000}Mbps, Timeslice: ${timeslice}ms`);

    }, [onRecordingComplete]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        recordingStartTimeRef.current = 0;
        audioInfoRef.current = null;
    }, []);

    const getRecordingDuration = useCallback(() => {
        if (recordingStartTimeRef.current === 0) return 0;
        return (Date.now() - recordingStartTimeRef.current) / 1000;
    }, []);

    const getRecordingInfo = useCallback(() => {
        return {
            isRecording,
            duration: getRecordingDuration(),
            audioInfo: audioInfoRef.current,
            startTime: recordingStartTimeRef.current
        };
    }, [isRecording, getRecordingDuration]);

    return { 
        isRecording, 
        startRecording, 
        stopRecording, 
        getRecordingDuration,
        getRecordingInfo
    };
};