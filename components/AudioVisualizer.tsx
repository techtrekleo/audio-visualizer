
import React, { useRef, useEffect, forwardRef } from 'react';
import { VisualizationType, Palette, GraphicEffectType, ColorPaletteType } from '../types';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    visualizationType: VisualizationType;
    isPlaying: boolean;
    customText: string;
    textColor: string;
    fontFamily: string;
    graphicEffect: GraphicEffectType;
    sensitivity: number;
    smoothing: number;
    equalization: number;
    backgroundColor: string;
    colors: Palette;
}

const createRoundedRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    if (radius < 0) radius = 0;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
};

const drawMonstercat = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    
    if (graphicEffect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
    }

    const numBarsOnHalf = 64;
    const totalBars = numBarsOnHalf * 2;
    const barWidth = width / totalBars;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxHeight = height * 0.45;

    const dataSliceEnd = Math.floor(dataArray.length * 0.7);
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;

    for (let i = 0; i < numBarsOnHalf; i++) {
        const dataIndex = Math.floor((i / numBarsOnHalf) * dataSliceEnd);
        const amplitude = dataArray[dataIndex] / 255.0;
        const barHeight = Math.pow(amplitude, 2.5) * maxHeight * sensitivity;

        if (barHeight < 2) continue;

        let color;
        if (colors.name === ColorPaletteType.WHITE) {
            const lightness = 85 + (amplitude * 15);
            color = `hsl(220, 10%, ${lightness}%)`;
        } else {
            const hue = startHue + ((i / numBarsOnHalf) * hueRangeSpan);
            const saturation = isBeat ? 100 : 90;
            const lightness = 60 + (amplitude * 10);
            color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
        
        if (graphicEffect === GraphicEffectType.GLOW) {
            ctx.shadowColor = color;
            ctx.shadowBlur = isBeat ? 10 : 5;
        } else if (graphicEffect !== GraphicEffectType.SHADOW) {
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;

        const barGap = 2;
        const effectiveBarWidth = barWidth - barGap;
        const cornerRadius = Math.min(4, effectiveBarWidth / 3);
        
        const drawBars = (x: number) => {
            createRoundedRectPath(ctx, x, centerY - barHeight, effectiveBarWidth, barHeight, cornerRadius);
            ctx.fill();
            createRoundedRectPath(ctx, x, centerY, effectiveBarWidth, barHeight, cornerRadius);
            ctx.fill();

            if (graphicEffect === GraphicEffectType.STROKE) {
                ctx.save();
                ctx.shadowColor = 'transparent';
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = 1.5;
                createRoundedRectPath(ctx, x, centerY - barHeight, effectiveBarWidth, barHeight, cornerRadius);
                ctx.stroke();
                createRoundedRectPath(ctx, x, centerY, effectiveBarWidth, barHeight, cornerRadius);
                ctx.stroke();
                ctx.restore();
            }
        };

        drawBars(centerX - (i + 1) * barWidth + barGap / 2);
        drawBars(centerX + i * barWidth + barGap / 2);
    }

    ctx.restore();
};


const drawLuminousWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const maxAmplitude = height * 0.35;

    // 1. Draw central light beam
    const beamGradient = ctx.createLinearGradient(0, centerY, width, centerY);
    beamGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    beamGradient.addColorStop(0.2, `${colors.accent}40`);
    beamGradient.addColorStop(0.5, colors.accent);
    beamGradient.addColorStop(0.8, `${colors.accent}40`);
    beamGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = beamGradient;
    ctx.shadowBlur = 30;
    ctx.shadowColor = colors.accent;
    ctx.fillRect(0, centerY - 2, width, 4);
    
    // 2. Setup for the mirrored waves
    const waveGradient = ctx.createLinearGradient(centerX, centerY - maxAmplitude, centerX, centerY + maxAmplitude);
    waveGradient.addColorStop(0, `${colors.secondary}cc`);
    waveGradient.addColorStop(0.4, colors.primary);
    waveGradient.addColorStop(0.5, colors.accent);
    waveGradient.addColorStop(0.6, colors.primary);
    waveGradient.addColorStop(1, `${colors.secondary}cc`);

    ctx.strokeStyle = waveGradient;
    ctx.lineWidth = 2.5;
    
    if (graphicEffect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    } else if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.primary;
    }

    // 3. New drawing logic for mirrored, separated waves
    const drawMirroredBezierWave = (side: 'left' | 'right') => {
        const numPointsOnSide = 128;
        const dataSliceLength = dataArray.length * 0.5;

        const topPoints: {x: number, y: number}[] = [];
        const bottomPoints: {x: number, y: number}[] = [];

        for (let i = 0; i <= numPointsOnSide; i++) {
            const progress = i / numPointsOnSide;
            const dataIndex = Math.floor(progress * dataSliceLength);
            
            const x = side === 'left' ? centerX - (progress * centerX) : centerX + (progress * centerX);
            const amplitude = (dataArray[dataIndex] / 255) * maxAmplitude * sensitivity;
            const oscillation = Math.sin(i * 0.1 + frame * 0.05) * 5 * (amplitude / maxAmplitude);

            topPoints.push({ x, y: centerY - (amplitude + oscillation) });
            bottomPoints.push({ x, y: centerY + (amplitude + oscillation) });
        }
        
        const drawCurve = (points: {x: number, y: number}[]) => {
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i+1].x) / 2;
                const yc = (points[i].y + points[i+1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);

            if (graphicEffect === GraphicEffectType.STROKE) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = ctx.lineWidth + 2;
                ctx.shadowColor = 'transparent';
                ctx.stroke();
                ctx.restore();
            }
            ctx.stroke();
        };

        drawCurve(topPoints);
        drawCurve(bottomPoints);
    };

    drawMirroredBezierWave('left');
    drawMirroredBezierWave('right');
    
    ctx.restore();
};

const drawFusion = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;

    // --- Apply global shadow effect if selected ---
    if (graphicEffect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    }

    // --- 1. Draw dotted columns from the bottom ---
    const numColumns = 128;
    const columnSpacingX = width / numColumns;
    for (let i = 0; i < numColumns; i++) {
        const dataIndex = Math.floor(i * (dataArray.length * 0.7 / numColumns));
        const columnHeight = Math.pow(dataArray[dataIndex] / 255, 2) * height * 0.8 * sensitivity;
        if (columnHeight < 1) continue;
        
        let color;
        if (colors.name === ColorPaletteType.WHITE) {
            const lightness = 80 + (dataArray[dataIndex] / 255) * 20;
            color = `hsl(220, 5%, ${lightness}%)`;
        } else {
            const hue = startHue + (i / numColumns) * hueRangeSpan;
            color = `hsl(${hue}, 80%, 60%)`;
        }
        ctx.fillStyle = color;
        if (graphicEffect === GraphicEffectType.GLOW) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
        }
        
        const x = i * columnSpacingX + columnSpacingX / 2;
        const dotSpacingY = 8;
        const numDots = Math.floor(columnHeight / dotSpacingY);

        for (let j = 0; j < numDots; j++) {
            const y = height - j * dotSpacingY;
            const opacity = 1 - Math.pow(j / numDots, 2);
            ctx.globalAlpha = opacity;
            const radius = 1 + (dataArray[dataIndex] / 255) * 1.5;
            
            ctx.beginPath();
            ctx.arc(x, y - dotSpacingY / 2, radius, 0, Math.PI * 2);
            ctx.fill();
            if (graphicEffect === GraphicEffectType.STROKE) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0,0,0,0.7)';
                ctx.lineWidth = 1;
                ctx.shadowColor = 'transparent';
                ctx.stroke();
                ctx.restore();
            }
        }
    }
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0; // Reset shadow for waves

    // --- 2. Create Mirrored Base Wave Data ---
    const numPoints = Math.floor(width / 2);
    const dataSliceLength = dataArray.length * 0.35;
    const wave_base_data: { x: number, y_amp: number }[] = [];

    for (let i = 0; i <= numPoints / 2; i++) {
        const progress = i / (numPoints / 2);
        const x = centerX - (progress * centerX);
        const dataIndex = Math.floor(progress * dataSliceLength);
        const audioAmp = Math.pow(dataArray[dataIndex] / 255, 2) * 150 * sensitivity;
        wave_base_data.push({ x, y_amp: audioAmp });
    }
    const right_half = wave_base_data.slice(1).reverse().map(p => ({ x: width - p.x, y_amp: p.y_amp }));
    const full_wave_data = [...wave_base_data, ...right_half];

    // --- 3. Draw waves ---
    const solidWaveAmpMultiplier = 0.6;
    const dottedWaveAmpMultiplier = 1.2;

    // Draw Solid Wave
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 15;
    }
    
    ctx.beginPath();
    const firstPoint = full_wave_data[0];
    const yOscSolid_first = Math.sin(firstPoint.x * 0.05 + frame * 0.02) * 5; 
    ctx.moveTo(firstPoint.x, centerY + firstPoint.y_amp * solidWaveAmpMultiplier + yOscSolid_first);
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        ctx.lineTo(p.x, centerY + p.y_amp * solidWaveAmpMultiplier + yOsc);
    }
    for (let i = full_wave_data.length - 1; i >= 0; i--) {
        const p = full_wave_data[i];
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        ctx.lineTo(p.x, centerY - (p.y_amp * solidWaveAmpMultiplier) + yOsc);
    }
    ctx.closePath();

    if (graphicEffect === GraphicEffectType.STROKE) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = ctx.lineWidth + 2;
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        ctx.restore();
    }
    ctx.stroke();

    // Draw Dotted Wave
    ctx.fillStyle = colors.secondary;
    if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowColor = colors.secondary;
        ctx.shadowBlur = 10;
    }
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.08 + frame * -0.03) * 8; 
        const y_top = centerY + p.y_amp * dottedWaveAmpMultiplier + yOsc;
        const y_bottom = centerY - p.y_amp * dottedWaveAmpMultiplier + yOsc;

        ctx.beginPath();
        ctx.arc(p.x, y_top, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, y_bottom, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
};

const drawNebulaWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;

    if (graphicEffect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    }
    
    const numPoints = Math.floor(width / 2);
    const dataSliceLength = dataArray.length * 0.35;
    const wave_base_data: { x: number, y_amp: number }[] = [];

    for (let i = 0; i <= numPoints / 2; i++) {
        const progress = i / (numPoints / 2);
        const x = centerX - (progress * centerX);
        const dataIndex = Math.floor(progress * dataSliceLength);
        const audioAmp = Math.pow(dataArray[dataIndex] / 255, 2) * 150 * sensitivity;
        wave_base_data.push({ x, y_amp: audioAmp });
    }
    const right_half = wave_base_data.slice(1).reverse().map(p => ({ x: width - p.x, y_amp: p.y_amp }));
    const full_wave_data = [...wave_base_data, ...right_half];

    const solidWaveAmpMultiplier = 0.6;
    const dottedWaveAmpMultiplier = 1.2;

    // Draw Solid Wave
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 15;
    }

    ctx.beginPath();
    const firstPoint = full_wave_data[0];
    const yOscSolid_first = Math.sin(firstPoint.x * 0.05 + frame * 0.02) * 5; 
    ctx.moveTo(firstPoint.x, centerY + firstPoint.y_amp * solidWaveAmpMultiplier + yOscSolid_first);
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        ctx.lineTo(p.x, centerY + p.y_amp * solidWaveAmpMultiplier + yOsc);
    }
    for (let i = full_wave_data.length - 1; i >= 0; i--) {
        const p = full_wave_data[i];
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        ctx.lineTo(p.x, centerY - (p.y_amp * solidWaveAmpMultiplier) + yOsc);
    }
    ctx.closePath();

    if (graphicEffect === GraphicEffectType.STROKE) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = ctx.lineWidth + 2;
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        ctx.restore();
    }
    ctx.stroke();

    // Draw Dotted Wave
    ctx.fillStyle = colors.secondary;
    if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowColor = colors.secondary;
        ctx.shadowBlur = 10;
    }
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.08 + frame * -0.03) * 8; 
        const y_top = centerY + p.y_amp * dottedWaveAmpMultiplier + yOsc;
        const y_bottom = centerY - p.y_amp * dottedWaveAmpMultiplier + yOsc;
        
        ctx.beginPath();
        ctx.arc(p.x, y_top, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, y_bottom, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
};

const drawTechWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.15;
    const bars = 128;
    
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;
    
    let color;
    if (colors.name === ColorPaletteType.WHITE) {
        color = colors.primary;
    } else {
        const hue = startHue + ((frame / 2) % hueRangeSpan);
        color = `hsl(${hue}, 80%, 60%)`;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    if (graphicEffect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    } else if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
    }


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
        
        if (graphicEffect === GraphicEffectType.STROKE) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = ctx.lineWidth + 2;
            ctx.shadowColor = 'transparent';
            ctx.stroke();
            ctx.restore();
        }
        ctx.stroke();
    }
    ctx.restore();
};

const drawStellarCore = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const normalizedBass = bass / 255;
    
    // 1. Pulsating Background Glow
    const bgGlowRadius = Math.min(width, height) * 0.5 + normalizedBass * 50;
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bgGlowRadius);
    bgGradient.addColorStop(0, colors.backgroundGlow);
    bgGradient.addColorStop(1, 'rgba(10, 20, 40, 0)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.save();
    if (graphicEffect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
    }

    // 2. Frequency "Tendrils"
    const spikes = 180;
    const spikeBaseRadius = Math.min(width, height) * 0.15;
    ctx.strokeStyle = colors.primary;
    if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 10;
    }
    ctx.lineWidth = 4; // Increased from 2.5

    for (let i = 0; i < spikes; i++) {
        const dataIndex = Math.floor((i / spikes) * (dataArray.length * 0.5));
        const spikeHeight = Math.pow(dataArray[dataIndex] / 255, 1.8) * 150 * sensitivity;
        if (spikeHeight < 1) continue;
        
        const angle = (i / spikes) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * spikeBaseRadius;
        const y1 = centerY + Math.sin(angle) * spikeBaseRadius;
        const x2 = centerX + Math.cos(angle) * (spikeBaseRadius + spikeHeight);
        const y2 = centerY + Math.sin(angle) * (spikeBaseRadius + spikeHeight);
        
        const controlPointRadius = spikeBaseRadius + spikeHeight / 2;
        const swirlAngle = angle + Math.PI / 2;
        const swirlAmount = (spikeHeight / 10) + Math.sin(frame * 0.05 + i * 0.1) * 10;
        const controlX = centerX + Math.cos(angle) * controlPointRadius + Math.cos(swirlAngle) * swirlAmount;
        const controlY = centerY + Math.sin(angle) * controlPointRadius + Math.sin(swirlAngle) * swirlAmount;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(controlX, controlY, x2, y2);
        
        if (graphicEffect === GraphicEffectType.STROKE) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = ctx.lineWidth + 2;
            ctx.shadowColor = 'transparent';
            ctx.stroke();
            ctx.restore();
        }
        ctx.stroke();
    }
    ctx.restore(); // Restore from tendril shadow/glow effect
    
    // 3. Central Core
    const coreRadius = Math.min(width, height) * 0.05 + normalizedBass * 30;
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGradient.addColorStop(0, colors.accent);
    coreGradient.addColorStop(0.3, colors.primary);
    coreGradient.addColorStop(1, 'rgba(0, 150, 200, 0)');
    
    ctx.shadowBlur = 40;
    ctx.shadowColor = colors.primary;
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
};


const drawRadialBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const color = isBeat ? colors.accent : colors.primary;
    
    if (graphicEffect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    } else if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
    }
    ctx.strokeStyle = color;

    const innerRadius = Math.min(width, height) * 0.22;
    const outerRadius = innerRadius + (width * 0.015);

    const drawSpikes = (radius: number, spikes: number, maxHeight: number, dataStart: number, dataEnd: number, direction: number, lineWidth: number) => {
        ctx.lineWidth = lineWidth;
        for (let i = 0; i < spikes; i++) {
            const dataIndex = Math.floor(dataStart + (i / spikes) * (dataEnd - dataStart));
            const spikeHeight = Math.pow(dataArray[dataIndex] / 255, 2) * maxHeight * sensitivity;
            if (spikeHeight < 1) continue;
            
            const angle = (i / spikes) * Math.PI * 2 - Math.PI / 2;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + spikeHeight * direction);
            const y2 = centerY + Math.sin(angle) * (radius + spikeHeight * direction);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            
            if (graphicEffect === GraphicEffectType.STROKE) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = ctx.lineWidth + 2;
                ctx.shadowColor = 'transparent';
                ctx.stroke();
                ctx.restore();
            }
            ctx.stroke();
        }
    };

    // Inner Circle (Bass spikes pointing INWARDS)
    drawSpikes(innerRadius, 128, Math.min(width, height) * 0.08, 0, 64, -1, 2);
    // Outer Circle (Treble spikes pointing OUTWARDS)
    drawSpikes(outerRadius, 128, Math.min(width, height) * 0.28, 100, dataArray.length / 4, 1, 2);

    ctx.restore();
};

const drawParticleGalaxy = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Core logic is handled by the particle system in the main component.
    // This function can draw a static background element if needed, e.g., a central star.
    const bass = dataArray.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
    const normalizedBass = bass / 255;
    const coreRadius = (Math.min(width, height) * 0.04) + (normalizedBass * 30 * sensitivity);

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.2, colors.accent);
    gradient.addColorStop(0.6, colors.primary);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 30;
    }
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

const drawLiquidMetal = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    // This effect is fully driven by the particle system ("blobs")
    // in the main component's render loop.
    // We can add a background glow here.
    const centerX = width / 2;
    const centerY = height / 2;
    const bass = dataArray.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
    const normalizedBass = bass / 255;
    const glowRadius = width * 0.2 + normalizedBass * width * 0.2;

    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
    bgGradient.addColorStop(0, `${colors.secondary}33`);
    bgGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
};

const drawCrtGlitch = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    ctx.save();
    
    if (isBeat) {
        ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    }
    
    const centerY = height / 2;

    const drawWave = (color: string, offsetX = 0, offsetY = 0) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        const sliceWidth = width / (dataArray.length * 0.5);
        for (let i = 0; i < dataArray.length * 0.5; i++) {
            const x = i * sliceWidth + offsetX;
            const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
            const y = centerY + amp + offsetY;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    };

    // Glitch effect on beat
    if (isBeat) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = 2;
        drawWave('rgba(255, 0, 100, 0.7)', -12); // Magenta
        drawWave('rgba(0, 255, 255, 0.7)', 12);  // Cyan
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 2.5;
    if (graphicEffect === GraphicEffectType.GLOW) {
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 10;
    }
    drawWave(colors.primary);

    // Scanlines effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 2);
    }
    
    // Horizontal slip glitch on beat
    if (isBeat) {
        const slipY = Math.random() * height * 0.8;
        const slipHeight = Math.random() * height * 0.1;
        const slipShift = (Math.random() - 0.5) * 80;
        try { // getImageData can throw security errors on tainted canvases
            const slice = ctx.getImageData(0, slipY, width, slipHeight);
            ctx.clearRect(0, slipY, width, slipHeight);
            ctx.putImageData(slice, slipShift, slipY);
        } catch(e) {
            // Ignore error
        }
    }
    
    ctx.restore();
};


const drawPulsingText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    dataArray: Uint8Array,
    width: number,
    height: number,
    color: string,
    fontFamily: string
) => {
    if (!text) return;

    ctx.save();

    // 1. Setup common properties
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
    ctx.lineJoin = 'round';
    
    // 2. Draw Neon Glow Layers (background auras)
    ctx.fillStyle = 'rgba(0,0,0,0)'; // We only want the shadow, not the fill itself
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillText(text, centerX, centerY);
    ctx.shadowBlur = 15;
    ctx.fillText(text, centerX, centerY);
    ctx.shadowBlur = 5;
    ctx.fillText(text, centerX, centerY);
    
    // Reset shadow after glows
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // 3. Draw the main text fill on top of everything
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
    sensitivity: number,
    colors: Palette,
    graphicEffect: GraphicEffectType,
    isBeat?: boolean
) => void;

const VISUALIZATION_MAP: Record<VisualizationType, DrawFunction> = {
    [VisualizationType.MONSTERCAT]: drawMonstercat,
    [VisualizationType.NEBULA_WAVE]: drawNebulaWave,
    [VisualizationType.LUMINOUS_WAVE]: drawLuminousWave,
    [VisualizationType.FUSION]: drawFusion,
    [VisualizationType.TECH_WAVE]: drawTechWave,
    [VisualizationType.STELLAR_CORE]: drawStellarCore,
    [VisualizationType.RADIAL_BARS]: drawRadialBars,
    [VisualizationType.PARTICLE_GALAXY]: drawParticleGalaxy,
    [VisualizationType.LIQUID_METAL]: drawLiquidMetal,
    [VisualizationType.CRT_GLITCH]: drawCrtGlitch,
};

type Particle = {
    x: number;
    y: number;
    // Linear motion (for Fusion, Luminous Wave)
    vx: number;
    vy: number;
    // Orbital motion (for Stellar Core, Particle Galaxy)
    angle: number;
    orbitRadius: number;
    baseOrbitRadius: number;
    angleVelocity: number;
    // Common properties
    radius: number;
    opacity: number;
    color: string;
};


type Shockwave = {
    radius: number;
    opacity: number;
    lineWidth: number;
};


const AudioVisualizer = forwardRef<HTMLCanvasElement, AudioVisualizerProps>(({ analyser, visualizationType, isPlaying, customText, textColor, fontFamily, graphicEffect, sensitivity, smoothing, equalization, backgroundColor, colors }, ref) => {
    const animationFrameId = useRef<number>(0);
    const frame = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const shockwavesRef = useRef<Shockwave[]>([]);

    useEffect(() => {
        // Clear dynamic elements when visualization changes to prevent artifacts
        particlesRef.current = [];
        shockwavesRef.current = [];
    }, [visualizationType]);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let beatCooldown = 0;

        const renderFrame = () => {
            frame.current++;
            analyser.getByteFrequencyData(dataArray);

            const bassAvg = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
            let isBeat = false;
            if (bassAvg > 180 && beatCooldown <= 0) {
                 isBeat = true;
                 beatCooldown = 10; // Cooldown for 10 frames to avoid too many shockwaves
            }
            if(beatCooldown > 0) beatCooldown--;
            
            const balancedData = equalizeDataArray(dataArray, equalization);
            const smoothedData = smoothDataArray(balancedData, smoothing);

            const { width, height } = canvas;
            const centerX = width / 2;
            const centerY = height / 2;
            
            // Clear canvas based on background type
            if (backgroundColor === 'transparent') {
                ctx.clearRect(0, 0, width, height);
            } else {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, width, height);
            }
            
            const drawFunction = VISUALIZATION_MAP[visualizationType];
            if (drawFunction) {
                // For Stellar Core, draw the glow on top of the base background
                if (visualizationType === VisualizationType.STELLAR_CORE) {
                    const bass = smoothedData.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
                    const normalizedBass = bass / 255;
                    const bgGlowRadius = Math.min(width, height) * 0.5 + normalizedBass * 50;
                    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bgGlowRadius);
                    bgGradient.addColorStop(0, colors.backgroundGlow);
                    bgGradient.addColorStop(1, 'rgba(10, 20, 40, 0)');
                    ctx.fillStyle = bgGradient;
                    ctx.fillRect(0, 0, width, height);
                }
                drawFunction(ctx, smoothedData, width, height, frame.current, sensitivity, colors, graphicEffect, isBeat);
            }
            
            // --- Handle Dynamic Elements (Particles, Shockwaves, etc.) ---
            if (visualizationType === VisualizationType.STELLAR_CORE) {
                // Initialize particles if needed
                if (particlesRef.current.length === 0) {
                    const numParticles = 200;
                    for (let i = 0; i < numParticles; i++) {
                        const baseOrbitRadius = Math.min(width, height) * 0.15 + Math.random() * 20;
                        particlesRef.current.push({
                            x: 0, y: 0, vx: 0, vy: 0,
                            angle: Math.random() * Math.PI * 2,
                            orbitRadius: baseOrbitRadius,
                            baseOrbitRadius: baseOrbitRadius,
                            radius: Math.random() * 1.5 + 0.5,
                            opacity: Math.random() * 0.5 + 0.5,
                            color: Math.random() > 0.3 ? colors.primary : colors.secondary,
                            angleVelocity: 0.005,
                        });
                    }
                }
                
                // Update and draw orbital particles
                const midFrequencies = smoothedData.slice(32, 96).reduce((a, b) => a + b, 0) / 64;
                const orbitFlux = (midFrequencies / 255) * 30 * sensitivity;

                particlesRef.current.forEach(p => {
                    p.angle += p.angleVelocity;
                    p.orbitRadius = p.baseOrbitRadius + orbitFlux;
                    p.x = centerX + Math.cos(p.angle) * p.orbitRadius;
                    p.y = centerY + Math.sin(p.angle) * p.orbitRadius;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `${p.color}${Math.round(p.opacity * 255).toString(16).padStart(2, '0')}`;
                    ctx.fill();
                });
                
                // Spawn and manage shockwaves
                if (isBeat) {
                    shockwavesRef.current.push({ radius: Math.min(width, height) * 0.15, opacity: 1, lineWidth: 3 });
                }

            } else if (visualizationType === VisualizationType.PARTICLE_GALAXY) {
                 if (particlesRef.current.length === 0) {
                    const numParticles = 2000;
                    for (let i = 0; i < numParticles; i++) {
                        const baseOrbitRadius = Math.random() * width * 0.4;
                        particlesRef.current.push({
                            x: 0, y: 0, vx: 0, vy: 0,
                            angle: Math.random() * Math.PI * 2,
                            orbitRadius: baseOrbitRadius,
                            baseOrbitRadius,
                            angleVelocity: 0.001 + (1 / (baseOrbitRadius + 10)) * 0.2,
                            radius: Math.random() * 1.5 + 0.2,
                            opacity: Math.random() * 0.8 + 0.2,
                            color: Math.random() > 0.5 ? colors.primary : colors.secondary,
                        });
                    }
                }
                const bass = smoothedData.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
                const gravity = Math.pow(bass / 255, 2) * 20 * sensitivity;
                const flare = (smoothedData.slice(100, 200).reduce((a, b) => a + b, 0) / 100) / 255;
                
                particlesRef.current.forEach(p => {
                    p.angle += p.angleVelocity;
                    p.orbitRadius = p.baseOrbitRadius - gravity + flare * 20;
                    p.x = centerX + Math.cos(p.angle) * p.orbitRadius;
                    p.y = centerY + Math.sin(p.angle) * p.orbitRadius;
                    
                    const lightness = 60 + flare * 40;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${colors.hueRange[0]}, 90%, ${lightness}%, ${p.opacity})`;
                    ctx.fill();
                });
            
            } else if (visualizationType === VisualizationType.LIQUID_METAL) {
                 if (particlesRef.current.length === 0) {
                    const numBlobs = 15;
                    for (let i = 0; i < numBlobs; i++) {
                        particlesRef.current.push({
                            x: centerX + (Math.random() - 0.5) * 50,
                            y: centerY + (Math.random() - 0.5) * 50,
                            vx: (Math.random() - 0.5) * 2,
                            vy: (Math.random() - 0.5) * 2,
                            radius: Math.random() * 30 + 20,
                            opacity: 1, color: '', angle: 0, orbitRadius: 0, baseOrbitRadius: 0, angleVelocity: 0,
                        });
                    }
                }
                const bass = (smoothedData.slice(0, 16).reduce((a,b)=>a+b,0)/16)/255;
                const energy = (smoothedData.reduce((a,b)=>a+b,0)/smoothedData.length)/255;

                ctx.globalCompositeOperation = 'lighter';
                particlesRef.current.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx += (centerX - p.x) * 0.001 + (Math.random() - 0.5) * 0.2;
                    p.vy += (centerY - p.y) * 0.001 + (Math.random() - 0.5) * 0.2;
                    
                    if (isBeat) {
                        p.vx += (Math.random() - 0.5) * bass * 15;
                        p.vy += (Math.random() - 0.5) * bass * 15;
                    }
                    if (p.vx > 3) p.vx = 3; if (p.vx < -3) p.vx = -3;
                    if (p.vy > 3) p.vy = 3; if (p.vy < -3) p.vy = -3;

                    const dynamicRadius = p.radius * (0.7 + energy * 0.5 + bass * 0.5);
                    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dynamicRadius);
                    g.addColorStop(0, `${colors.primary}ff`);
                    g.addColorStop(0.5, `${colors.secondary}88`);
                    g.addColorStop(1, `${colors.secondary}00`);

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, dynamicRadius, 0, Math.PI * 2);
                    ctx.fillStyle = g;
                    ctx.fill();
                });
                ctx.globalCompositeOperation = 'source-over';


            } else if (visualizationType === VisualizationType.LUMINOUS_WAVE || visualizationType === VisualizationType.FUSION) {
                // Update and draw linear particles
                particlesRef.current.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.opacity -= 0.01;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `${colors.accent}${Math.round(p.opacity * 255).toString(16).padStart(2, '0')}`;
                    ctx.fill();
                });
                particlesRef.current = particlesRef.current.filter(p => p.opacity > 0);
                
                // Spawn new particles based on effect
                if (visualizationType === VisualizationType.LUMINOUS_WAVE && Math.random() > 0.7) {
                    particlesRef.current.push({
                        x: centerX, y: centerY,
                        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                        radius: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.5 + 0.5,
                        angle: 0, orbitRadius: 0, baseOrbitRadius: 0, color: colors.accent, angleVelocity: 0,
                    });
                } else if (visualizationType === VisualizationType.FUSION) {
                    const bass = smoothedData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
                    if (bass > 160 && Math.random() > 0.6) {
                        for (let i = 0; i < 2; i++) {
                             particlesRef.current.push({
                                x: Math.random() * width, y: height,
                                vx: (Math.random() - 0.5) * 0.5, vy: -Math.random() * 1.5 - 0.5,
                                radius: Math.random() * 2 + 1, opacity: 1,
                                angle: 0, orbitRadius: 0, baseOrbitRadius: 0, color: colors.accent, angleVelocity: 0,
                            });
                        }
                    }
                }
            }

            // --- Handle Shared Dynamic Elements ---
            // Update and draw shockwaves (used by Stellar Core, etc.)
            shockwavesRef.current.forEach(s => {
                s.radius += 5;
                s.opacity -= 0.02;
                s.lineWidth = Math.max(0.1, s.lineWidth * 0.98);
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, s.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
                ctx.lineWidth = s.lineWidth;
                ctx.stroke();
            });
            shockwavesRef.current = shockwavesRef.current.filter(s => s.opacity > 0);


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
    }, [isPlaying, analyser, visualizationType, ref, customText, textColor, fontFamily, graphicEffect, sensitivity, smoothing, equalization, backgroundColor, colors]);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        if (!canvas) return;
        
        // Use ResizeObserver to detect when the canvas's CSS size changes.
        // This is the modern and correct way to handle canvas resizing.
        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            const rect = entry.contentRect;

            // The core fix: Set the canvas buffer size to its CSS display size.
            // This ensures that when we set style="width:3840px", canvas.width is also 3840.
            // No more devicePixelRatio scaling, which caused the blurriness.
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        });

        observer.observe(canvas);
        
        return () => {
            observer.disconnect();
        };
    }, [ref]);


    return <canvas ref={ref} className="w-full h-full" style={{ backgroundColor: 'transparent' }} />;
});

AudioVisualizer.displayName = 'AudioVisualizer';

export default AudioVisualizer;