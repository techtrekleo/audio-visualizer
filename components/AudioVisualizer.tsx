import React, { useRef, useEffect, forwardRef } from 'react';
import { VisualizationType } from '../types';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    visualizationType: VisualizationType;
    isPlaying: boolean;
    customText: string;
    textColor: string;
    fontFamily: string;
    sensitivity: number;
    smoothing: number;
    equalization: number;
}

const drawMonstercat = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    const numBars = 90; 
    const radius = Math.min(width, height) * 0.18;
    const maxBarHeight = Math.min(width, height) * 0.28;
    const arcAngle = Math.PI * 2; // 360 degrees for a full circle
    
    const dataPoints = numBars / 2;
    
    const barValues = new Uint8Array(dataPoints);
    const dataSlice = dataArray.slice(0, 512); 
    const step = Math.floor(dataSlice.length / dataPoints);
    if (step > 0) {
        for(let i=0; i < dataPoints; i++){
            let sum = 0;
            for(let j=0; j < step; j++){
                sum += dataSlice[i*step + j];
            }
            barValues[i] = sum / step;
        }
    }

    ctx.strokeStyle = '#67E8F9';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#0CF5F5';

    const angleStep = (arcAngle / 2) / dataPoints;

    for (let i = 0; i < dataPoints; i++) {
        const barHeight = (barValues[i] / 255) * maxBarHeight * sensitivity;
        if (barHeight < 1) continue; 

        const angleTop = Math.PI - (i * angleStep);
        const x1_t = centerX + Math.cos(angleTop) * radius;
        const y1_t = centerY + Math.sin(angleTop) * radius;
        const x2_t = centerX + Math.cos(angleTop) * (radius + barHeight);
        const y2_t = centerY + Math.sin(angleTop) * (radius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1_t, y1_t);
        ctx.lineTo(x2_t, y2_t);
        ctx.stroke();

        const angleBottom = Math.PI + (i * angleStep);
        const x1_b = centerX + Math.cos(angleBottom) * radius;
        const y1_b = centerY + Math.sin(angleBottom) * radius;
        const x2_b = centerX + Math.cos(angleBottom) * (radius + barHeight);
        const y2_b = centerY + Math.sin(angleBottom) * (radius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1_b, y1_b);
        ctx.lineTo(x2_b, y2_b);
        ctx.stroke();
    }
    
    ctx.restore();
};

const drawTechWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.15;
    const bars = 128;
    
    ctx.strokeStyle = `hsl(${frame / 2}, 80%, 60%)`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsl(${frame / 2}, 80%, 60%)`;

    for (let i = 0; i < bars; i++) {
        const barHeight = dataArray[i] * 0.5 * sensitivity;
        const angle = (i / bars) * Math.PI * 2;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.restore();
};

const drawMagicCircle = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.2;
    const points = 180;
    
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    
    for (let j = 1; j <= 3; j++) {
        const radius = baseRadius * j * 0.7;
        const colorVal = (frame + j * 60) % 360;
        ctx.strokeStyle = `hsl(${colorVal}, 90%, 65%)`;
        ctx.shadowColor = `hsl(${colorVal}, 90%, 65%)`;

        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const index = Math.floor((i / points) * dataArray.length * 0.7);
            const amplitude = (dataArray[index] / 10) * sensitivity;
            const angle = (i / points) * Math.PI * 2 + (frame / 100) * (j % 2 === 0 ? -1 : 1);
            
            const currentRadius = radius + amplitude;
            const x = centerX + Math.cos(angle) * currentRadius;
            const y = centerY + Math.sin(angle) * currentRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    ctx.restore();
};

const drawRadialBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.1;
    const bars = 256;
    const maxBarHeight = Math.min(width, height) * 0.35;
    
    for (let i = 0; i < bars; i++) {
        const barHeight = ((dataArray[i] / 255) * maxBarHeight) * sensitivity;
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const hue = (i / bars) * 360 + frame;

        ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
        ctx.lineWidth = (width / bars) * 0.8;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.restore();
};

const drawPulsingText = (ctx: CanvasRenderingContext2D, text: string, dataArray: Uint8Array, width: number, height: number, color: string, fontFamily: string) => {
    if (!text) return;

    ctx.save();

    const centerX = width / 2;
    const centerY = height / 2;

    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const normalizedBass = bass / 255;
    
    const baseFontSize = Math.min(width, height) * 0.1;
    const pulseAmount = Math.min(width, height) * 0.05;
    const fontSize = baseFontSize + (normalizedBass * pulseAmount);

    ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // --- Enhanced Neon Glow Effect ---

    // 1. Outer, diffuse glow. We draw the text multiple times to layer the shadows.
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    // By setting fillStyle to a transparent color, we only draw the shadow, not the text fill itself.
    ctx.fillStyle = 'rgba(0,0,0,0)'; 
    ctx.fillText(text, centerX, centerY);

    // 2. Mid-level glow
    ctx.shadowBlur = 15;
    ctx.fillText(text, centerX, centerY);
    
    // 3. Inner, bright glow
    ctx.shadowBlur = 5;
    ctx.fillText(text, centerX, centerY);

    // 4. Main text fill - a bright gradient to simulate a neon tube's core
    ctx.shadowColor = 'transparent'; // Disable shadow for the main fill
    ctx.shadowBlur = 0;
    
    const gradient = ctx.createLinearGradient(0, centerY - fontSize / 2, 0, centerY + fontSize / 2);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.8, color);
    gradient.addColorStop(1, color);

    ctx.fillStyle = gradient;
    ctx.fillText(text, centerX, centerY);

    ctx.restore();
};

const equalizeDataArray = (data: Uint8Array, balance: number): Uint8Array => {
    if (balance <= 0) {
        return data;
    }
    const equalizedData = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        const adjustment = Math.pow(i / data.length, balance);
        equalizedData[i] = data[i] * adjustment;
    }
    return equalizedData;
};


const smoothDataArray = (data: Uint8Array, windowSize: number): Uint8Array => {
    if (windowSize <= 0) {
        return data;
    }
    const smoothedData = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize);
        const end = Math.min(data.length - 1, i + windowSize);
        let sum = 0;
        for (let j = start; j <= end; j++) {
            sum += data[j];
        }
        smoothedData[i] = sum / (end - start + 1);
    }
    return smoothedData;
};

type DrawFunction = (
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array, 
    width: number, 
    height: number, 
    frame: number,
    sensitivity: number
) => void;

const VISUALIZATION_MAP: Record<VisualizationType, DrawFunction> = {
    [VisualizationType.MONSTERCAT]: drawMonstercat,
    [VisualizationType.TECH_WAVE]: drawTechWave,
    [VisualizationType.MAGIC_CIRCLE]: drawMagicCircle,
    [VisualizationType.RADIAL_BARS]: drawRadialBars,
};

const AudioVisualizer = forwardRef<HTMLCanvasElement, AudioVisualizerProps>(({ analyser, visualizationType, isPlaying, customText, textColor, fontFamily, sensitivity, smoothing, equalization }, ref) => {
    const animationFrameId = useRef<number>(0);
    const frame = useRef<number>(0);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const renderFrame = () => {
            frame.current++;
            analyser.getByteFrequencyData(dataArray);
            
            const balancedData = equalizeDataArray(dataArray, equalization);
            const smoothedData = smoothDataArray(balancedData, smoothing);

            const rect = canvas.getBoundingClientRect();
            const { width, height } = rect;

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            
            const drawFunction = VISUALIZATION_MAP[visualizationType];
            drawFunction(ctx, smoothedData, width, height, frame.current, sensitivity);

            if (customText) {
                drawPulsingText(ctx, customText, smoothedData, width, height, textColor, fontFamily);
            }
            
            if (isPlaying) {
                animationFrameId.current = requestAnimationFrame(renderFrame);
            }
        };

        if (isPlaying) {
            renderFrame();
        } else {
             cancelAnimationFrame(animationFrameId.current);
        }

        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [isPlaying, analyser, visualizationType, ref, customText, textColor, fontFamily, sensitivity, smoothing, equalization]);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        if (!canvas) return;
        
        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height > 0) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [ref]);


    return <canvas ref={ref} className="w-full h-full" />;
});

AudioVisualizer.displayName = 'AudioVisualizer';

export default AudioVisualizer;