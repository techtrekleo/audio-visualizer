



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

const drawLuminousWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const numPoints = 256;
    const maxAmplitude = height * 0.35;

    // 1. Draw central light beam
    const beamGradient = ctx.createLinearGradient(0, centerY, width, centerY);
    beamGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    beamGradient.addColorStop(0.2, 'rgba(173, 235, 255, 0.5)');
    beamGradient.addColorStop(0.5, 'rgba(200, 255, 255, 1)');
    beamGradient.addColorStop(0.8, 'rgba(173, 235, 255, 0.5)');
    beamGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = beamGradient;
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.7)';
    ctx.fillRect(0, centerY - 2, width, 4);
    ctx.shadowBlur = 0;


    // 2. Draw the waveform
    const waveGradient = ctx.createLinearGradient(centerX, centerY - maxAmplitude, centerX, centerY + maxAmplitude);
    waveGradient.addColorStop(0, 'rgba(255, 100, 200, 0.8)'); // Pinkish top
    waveGradient.addColorStop(0.4, 'rgba(0, 255, 255, 1)'); // Cyan middle
    waveGradient.addColorStop(0.5, 'rgba(200, 255, 255, 1)'); // White core
    waveGradient.addColorStop(0.6, 'rgba(0, 255, 255, 1)'); // Cyan middle
    waveGradient.addColorStop(1, 'rgba(255, 100, 200, 0.8)'); // Pinkish bottom

    ctx.strokeStyle = waveGradient;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
    
    // Improved drawing logic for open ends
    const drawSmoothedWave = (direction: 'top' | 'bottom') => {
        ctx.beginPath();
        const sign = direction === 'top' ? -1 : 1;
        
        for (let i = 0; i <= numPoints; i++) {
            const dataIndex = Math.floor((i / numPoints) * (dataArray.length * 0.5));
            const amplitude = (dataArray[dataIndex] / 255) * maxAmplitude * sensitivity;
            const x = (i / numPoints) * width;
            const oscillation = Math.sin(i * 0.1 + frame * 0.05) * 5 * (amplitude/maxAmplitude); // Subtle secondary wave
            const y = centerY + sign * (amplitude + oscillation);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevDataIndex = Math.floor(((i - 1) / numPoints) * (dataArray.length * 0.5));
                const prevAmplitude = (dataArray[prevDataIndex] / 255) * maxAmplitude * sensitivity;
                const prevX = ((i-1)/numPoints) * width;
                const prevOscillation = Math.sin((i - 1) * 0.1 + frame * 0.05) * 5 * (prevAmplitude/maxAmplitude);
                const prevY = centerY + sign * (prevAmplitude + prevOscillation);
                
                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;
                ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
            }
        }
        ctx.stroke();
    };

    drawSmoothedWave('top');
    drawSmoothedWave('bottom');

    ctx.restore();
};

const drawFusion = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number) => {
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;

    // --- 1. Draw bars from the bottom ---
    const numBars = 128;
    const barWidth = width / numBars;
    ctx.shadowBlur = 10;
    for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor(i * (dataArray.length * 0.7 / numBars));
        const barHeight = (dataArray[dataIndex] / 255) * height * 0.7 * sensitivity;
        if (barHeight < 1) continue;
        
        const hue = 180 + (i / numBars) * 120; // Spectrum from Cyan to Magenta
        const color = `hsl(${hue}, 80%, 60%)`;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
    }
    
    ctx.shadowBlur = 0;

    // --- 2. Create Mirrored Base Wave Data ---
    const numPoints = Math.floor(width / 2);
    const dataSliceLength = dataArray.length * 0.35;
    const wave_base_data: { x: number, y_amp: number }[] = [];

    // Generate data for the left half
    for (let i = 0; i <= numPoints / 2; i++) {
        const progress = i / (numPoints / 2);
        const x = centerX - (progress * centerX);
        
        const dataIndex = Math.floor(progress * dataSliceLength);
        const audioAmp = Math.pow(dataArray[dataIndex] / 255, 2) * 150 * sensitivity;

        wave_base_data.push({ x, y_amp: audioAmp });
    }

    // Mirror to create the right half
    const right_half = wave_base_data.slice(1).reverse().map(p => ({
        x: width - p.x,
        y_amp: p.y_amp
    }));
    const full_wave_data = [...wave_base_data, ...right_half];

    // --- 3. Draw the overlapping waves with different amplitudes ---

    // Sensitivity multipliers for each wave
    const solidWaveAmpMultiplier = 0.6; // Less sensitive
    const dottedWaveAmpMultiplier = 1.2; // More sensitive, will have bigger amplitude

    // Draw Solid Wave (Less Sensitive)
    ctx.strokeStyle = '#67E8F9';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#67E8F9';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    const firstPoint = full_wave_data[0];
    const yOscSolid_first = Math.sin(firstPoint.x * 0.05 + frame * 0.02) * 5; 
    ctx.moveTo(firstPoint.x, centerY + firstPoint.y_amp * solidWaveAmpMultiplier + yOscSolid_first);

    // Top path
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        ctx.lineTo(p.x, centerY + p.y_amp * solidWaveAmpMultiplier + yOsc);
    }
    // Mirrored bottom path
    for (let i = full_wave_data.length - 1; i >= 0; i--) {
        const p = full_wave_data[i];
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        ctx.lineTo(p.x, centerY - (p.y_amp * solidWaveAmpMultiplier) + yOsc);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw Dotted Wave (More Sensitive)
    ctx.fillStyle = '#F472B6';
    ctx.shadowColor = '#F472B6';
    ctx.shadowBlur = 10;
    for (const p of full_wave_data) {
        // A different oscillation makes it more dynamic and appear to "float" around the solid wave
        const yOsc = Math.sin(p.x * 0.08 + frame * -0.03) * 8; 
        
        // Top dot
        const y_top = centerY + p.y_amp * dottedWaveAmpMultiplier + yOsc;
        ctx.beginPath();
        ctx.arc(p.x, y_top, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Bottom dot
        const y_bottom = centerY - p.y_amp * dottedWaveAmpMultiplier + yOsc;
        ctx.beginPath();
        ctx.arc(p.x, y_bottom, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
};

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

    // 1. Outer, diffuse glow.
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillStyle = 'rgba(0,0,0,0)'; 
    ctx.fillText(text, centerX, centerY);

    // 2. Mid-level glow
    ctx.shadowBlur = 15;
    ctx.fillText(text, centerX, centerY);
    
    // 3. Inner, bright glow
    ctx.shadowBlur = 5;
    ctx.fillText(text, centerX, centerY);
    
    // --- NEW: Add a dark outline for contrast ---
    ctx.shadowColor = 'transparent'; // Reset shadow for outline
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'; // Dark, semi-transparent outline
    ctx.lineWidth = fontSize * 0.04; // Line width relative to font size
    ctx.lineJoin = 'round'; // Makes corners look smoother
    ctx.strokeText(text, centerX, centerY);


    // 4. Main text fill - a bright gradient to simulate a neon tube's core
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
    [VisualizationType.LUMINOUS_WAVE]: drawLuminousWave,
    [VisualizationType.FUSION]: drawFusion,
    [VisualizationType.TECH_WAVE]: drawTechWave,
    [VisualizationType.MAGIC_CIRCLE]: drawMagicCircle,
    [VisualizationType.RADIAL_BARS]: drawRadialBars,
};

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
};


const AudioVisualizer = forwardRef<HTMLCanvasElement, AudioVisualizerProps>(({ analyser, visualizationType, isPlaying, customText, textColor, fontFamily, sensitivity, smoothing, equalization }, ref) => {
    const animationFrameId = useRef<number>(0);
    const frame = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);

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

            ctx.fillStyle = 'rgba(10, 15, 25, 1)';
            ctx.fillRect(0, 0, width, height);
            
            const drawFunction = VISUALIZATION_MAP[visualizationType];
            drawFunction(ctx, smoothedData, width, height, frame.current, sensitivity);
            
            // Handle particles
            if (visualizationType === VisualizationType.LUMINOUS_WAVE || visualizationType === VisualizationType.FUSION) {
                // Update and draw particles
                particlesRef.current.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.opacity -= 0.01;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(200, 255, 255, ${p.opacity})`;
                    ctx.fill();
                });
                // Filter out dead particles
                particlesRef.current = particlesRef.current.filter(p => p.opacity > 0);
                
                // Spawn new particles based on effect
                if (visualizationType === VisualizationType.LUMINOUS_WAVE && Math.random() > 0.7) {
                    particlesRef.current.push({
                        x: width / 2,
                        y: height / 2,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        radius: Math.random() * 1.5 + 0.5,
                        opacity: Math.random() * 0.5 + 0.5,
                    });
                } else if (visualizationType === VisualizationType.FUSION) {
                    const bass = smoothedData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
                    if (bass > 160 && Math.random() > 0.6) {
                        for (let i = 0; i < 2; i++) {
                             particlesRef.current.push({
                                x: Math.random() * width,
                                y: height,
                                vx: (Math.random() - 0.5) * 0.5,
                                vy: -Math.random() * 1.5 - 0.5,
                                radius: Math.random() * 2 + 1,
                                opacity: 1,
                            });
                        }
                    }
                }

            } else {
                 particlesRef.current = []; // Clear particles for other visualizers
            }


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