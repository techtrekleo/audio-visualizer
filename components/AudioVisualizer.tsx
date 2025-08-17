

import React, { useRef, useEffect, forwardRef } from 'react';
import { VisualizationType, Palette, GraphicEffectType, ColorPaletteType, WatermarkPosition, FontType, Subtitle, SubtitleBgStyle } from '../types';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    visualizationType: VisualizationType;
    isPlaying: boolean;
    customText: string;
    textColor: string;
    fontFamily: FontType;
    graphicEffect: GraphicEffectType;
    sensitivity: number;
    smoothing: number;
    equalization: number;
    backgroundColor: string;
    colors: Palette;
    backgroundImage: string | null;
    watermarkPosition: WatermarkPosition;
    waveformStroke: boolean;
    // Subtitle props
    subtitles: Subtitle[];
    showSubtitles: boolean;
    subtitleFontSize: number;
    subtitleFontFamily: FontType;
    subtitleColor: string;
    subtitleEffect: GraphicEffectType;
    subtitleBgStyle: SubtitleBgStyle;
    effectScale: number;
    effectOffsetX: number;
    effectOffsetY: number;
}

/**
 * Applies an alpha value to a given color string (hex or hsl).
 * @param color The color string (e.g., '#RRGGBB' or 'hsl(...)').
 * @param alpha The alpha value (0 to 1).
 * @returns A color string with alpha (e.g., '#RRGGBBAA' or 'hsla(...)').
 */
const applyAlphaToColor = (color: string, alpha: number): string => {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    if (color.startsWith('hsl')) {
        return color.replace('hsl', 'hsla').replace(')', `, ${clampedAlpha})`);
    }
    const alphaHex = Math.round(clampedAlpha * 255).toString(16).padStart(2, '0');
    return `${color.substring(0, 7)}${alphaHex}`;
};


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

const drawMonstercat = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    
    // Global effects are now handled in drawCustomText
    
    const numBarsOnHalf = 64;
    const totalBars = numBarsOnHalf * 2;
    const barWidth = width / totalBars;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxHeight = height * 0.45;

    const dataSliceEnd = Math.floor(dataArray.length * 0.7);
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;
    
    if (waveformStroke) {
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1.5;
    }

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
        
        ctx.shadowColor = color;
        ctx.shadowBlur = isBeat ? 10 : 5;
       
        ctx.fillStyle = color;

        const barGap = 2;
        const effectiveBarWidth = barWidth - barGap;
        const cornerRadius = Math.min(4, effectiveBarWidth / 3);
        
        const drawBars = (x: number) => {
            createRoundedRectPath(ctx, x, centerY - barHeight, effectiveBarWidth, barHeight, cornerRadius);
            ctx.fill();
            if (waveformStroke) ctx.stroke();

            createRoundedRectPath(ctx, x, centerY, effectiveBarWidth, barHeight, cornerRadius);
            ctx.fill();
            if (waveformStroke) ctx.stroke();
        };

        drawBars(centerX - (i + 1) * barWidth + barGap / 2);
        drawBars(centerX + i * barWidth + barGap / 2);
    }

    ctx.restore();
};


const drawLuminousWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const maxAmplitude = height * 0.35;

    // 1. Draw central light beam
    const beamGradient = ctx.createLinearGradient(0, centerY, width, centerY);
    beamGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    beamGradient.addColorStop(0.2, applyAlphaToColor(colors.accent, 0x40 / 255));
    beamGradient.addColorStop(0.5, colors.accent);
    beamGradient.addColorStop(0.8, applyAlphaToColor(colors.accent, 0x40 / 255));
    beamGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = beamGradient;
    ctx.shadowBlur = 30;
    ctx.shadowColor = colors.accent;
    ctx.fillRect(0, centerY - 2, width, 4);
    
    // 2. Setup for the mirrored waves
    const waveGradient = ctx.createLinearGradient(centerX, centerY - maxAmplitude, centerX, centerY + maxAmplitude);
    waveGradient.addColorStop(0, applyAlphaToColor(colors.secondary, 0xcc / 255));
    waveGradient.addColorStop(0.4, colors.primary);
    waveGradient.addColorStop(0.5, colors.accent);
    waveGradient.addColorStop(0.6, colors.primary);
    waveGradient.addColorStop(1, applyAlphaToColor(colors.secondary, 0xcc / 255));

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
            ctx.stroke();
        };

        if (waveformStroke) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 4.5;
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            drawCurve(topPoints);
            drawCurve(bottomPoints);
            ctx.restore();
        }

        ctx.strokeStyle = waveGradient;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.primary;
        drawCurve(topPoints);
        drawCurve(bottomPoints);
    };

    drawMirroredBezierWave('left');
    drawMirroredBezierWave('right');
    
    ctx.restore();
};

const drawFusion = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;

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
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;
        
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

    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        ctx.restore();
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Draw Dotted Wave
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 10;
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

const drawNebulaWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;

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

    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        ctx.restore();
    }

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Draw Dotted Wave
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 10;
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

const drawTechWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();

    const centerX = width / 2;
    const centerY = height * 0.55;
    const fov = width * 0.7;
    
    const gridSizeX = 30;
    const gridSizeZ = 40;
    const spacingX = width / gridSizeX * 2.5;
    const spacingZ = height / gridSizeZ * 1.5;
    const terrainHeight = height * 0.2;
    
    const zOffset = (frame * 2) % spacingZ;

    const project = (x3d: number, y3d: number, z3d: number) => {
        const scale = fov / (fov + z3d);
        const x2d = x3d * scale + centerX;
        const y2d = y3d * scale + centerY;
        return { x: x2d, y: y2d, scale };
    };

    const drawGrid = (yMultiplier: number, dataStart: number, dataEnd: number) => {
        const gridPoints: ({ x: number; y: number; scale: number } | null)[][] = [];

        // Calculate grid points with audio data
        for (let z = 0; z < gridSizeZ; z++) {
            gridPoints[z] = [];
            for (let x = 0; x < gridSizeX; x++) {
                const dataIndex = Math.floor(dataStart + (x / gridSizeX) * (dataEnd - dataStart));
                const audioAmp = Math.pow(dataArray[dataIndex] / 255.0, 2.5) * terrainHeight * sensitivity;

                const x3d = (x - gridSizeX / 2) * spacingX;
                const y3d = audioAmp * yMultiplier;
                const z3d = z * spacingZ - zOffset;

                const p = project(x3d, y3d, z3d);
                gridPoints[z][x] = (p.scale > 0) ? p : null;
            }
        }

        // Draw grid lines
        for (let z = 0; z < gridSizeZ - 1; z++) {
            const zProgress = z / gridSizeZ;
            const [startHue, endHue] = colors.hueRange;
            const hue = startHue + (zProgress * (endHue - startHue));
            const lightness = 30 + zProgress * 40;
            const opacity = 1 - zProgress;

            ctx.strokeStyle = `hsla(${hue}, 90%, ${lightness}%, ${opacity})`;
            ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${opacity * 0.7})`;
            ctx.shadowBlur = 10;

            // Draw horizontal lines connecting points at the same Z
            ctx.beginPath();
            for (let x = 0; x < gridSizeX; x++) {
                const p1 = gridPoints[z][x];
                if (p1) {
                    if (x === 0) ctx.moveTo(p1.x, p1.y);
                    else ctx.lineTo(p1.x, p1.y);
                }
            }
            ctx.stroke();

            // Draw vertical lines connecting points at the same X
            ctx.beginPath();
            for (let x = 0; x < gridSizeX; x++) {
                const p1 = gridPoints[z][x];
                const p2 = gridPoints[z + 1][x];
                if (p1 && p2) {
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                }
            }
            ctx.stroke();
        }
    };

    // Draw bottom grid (floor) - reacts to bass
    drawGrid(1, 0, Math.floor(dataArray.length * 0.2));

    // Draw top grid (ceiling) - reacts to treble
    drawGrid(-1, Math.floor(dataArray.length * 0.3), Math.floor(dataArray.length * 0.7));

    ctx.restore();
};

const drawStellarCore = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const normalizedBass = bass / 255;
    
    // 1. Pulsating Background Glow (moved to main render loop to be behind background image)
    
    ctx.save();

    // 2. Frequency "Tendrils"
    const spikes = 180;
    const spikeBaseRadius = Math.min(width, height) * 0.15;
    
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
        
        const drawCurve = () => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(controlX, controlY, x2, y2);
            ctx.stroke();
        };

        if (waveformStroke) {
            ctx.save();
            ctx.lineWidth = 6;
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            drawCurve();
            ctx.restore();
        }

        ctx.strokeStyle = colors.primary;
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 4;
        drawCurve();
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


const drawRadialBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    const innerRadius = Math.min(width, height) * 0.22;
    const outerRadius = innerRadius + (width * 0.015);

    const drawSpikes = (radius: number, spikes: number, maxHeight: number, dataStart: number, dataEnd: number, direction: number, mainLineWidth: number) => {
        const color = isBeat ? colors.accent : colors.primary;
        
        for (let i = 0; i < spikes; i++) {
            const dataIndex = Math.floor(dataStart + (i / spikes) * (dataEnd - dataStart));
            const spikeHeight = Math.pow(dataArray[dataIndex] / 255, 2) * maxHeight * sensitivity;
            if (spikeHeight < 1) continue;
            
            const angle = (i / spikes) * Math.PI * 2 - Math.PI / 2;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + spikeHeight * direction);
            const y2 = centerY + Math.sin(angle) * (radius + spikeHeight * direction);

            const drawLine = () => {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            };

            if (waveformStroke) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0,0,0,0.7)';
                ctx.lineWidth = mainLineWidth + 2;
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';
                drawLine();
                ctx.restore();
            }

            ctx.strokeStyle = color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.lineWidth = mainLineWidth;
            drawLine();
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
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 30;
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
    bgGradient.addColorStop(0, applyAlphaToColor(colors.secondary, 0x33 / 255));
    bgGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
};

const drawGlitchWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    
    const centerY = height / 2;

    const wavePath = new Path2D();
    const sliceWidth = width / (dataArray.length * 0.5);
    let x = 0;
     for (let i = 0; i < dataArray.length * 0.5; i++) {
        const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
        const y = centerY + amp;
        if (i === 0) {
            wavePath.moveTo(x, y);
        } else {
            wavePath.lineTo(x, y);
        }
        x += sliceWidth;
    }
    
    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke(wavePath);
        ctx.restore();
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    ctx.stroke(wavePath);

    // Add classic scanlines for the retro feel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < height; i += 3) {
        ctx.fillRect(0, i, width, 1);
    }
    
    // The key "wave" effect: horizontal slipping on beat
    if (isBeat) {
        const numSlices = Math.floor(Math.random() * 5) + 3; // 3 to 7 slices
        for (let i = 0; i < numSlices; i++) {
            const sy = Math.random() * height;
            const sh = (Math.random() * height) / 10 + 5; // A bit of height
            const sx = 0;
            const sw = width;
            const dx = (Math.random() - 0.5) * 50;
            const dy = sy;
            try {
               ctx.drawImage(ctx.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
            } catch(e) { /* ignored, can happen on cross-origin canvas */ }
        }
    }
    
    ctx.restore();
};


const drawCrtGlitch = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    
    // Original effect: Screen shake
    if (isBeat) {
        ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    }
    
    const centerY = height / 2;

    const drawWave = (color: string, offsetX = 0, offsetY = 0, customLineWidth?: number) => {
        ctx.strokeStyle = color;
        if(customLineWidth) ctx.lineWidth = customLineWidth;

        ctx.beginPath();
        const sliceWidth = width / (dataArray.length * 0.5);
        let x = 0;
        for (let i = 0; i < dataArray.length * 0.5; i++) {
            const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
            const y = centerY + amp + offsetY;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        ctx.stroke();
    };

    // Modified effect: Dynamic Chromatic Aberration
    // Happens occasionally without a beat, and intensely on a beat.
    const isGlitching = isBeat || Math.random() > 0.9;
    if (isGlitching) {
        ctx.globalCompositeOperation = 'lighter';
        const intensity = isBeat ? 12 : 4;
        drawWave('rgba(255, 0, 100, 0.7)', (Math.random() - 0.5) * intensity, 0, 2); // Magenta
        drawWave('rgba(0, 255, 255, 0.7)', (Math.random() - 0.5) * intensity, 0, 2);  // Cyan
    }
    
    ctx.globalCompositeOperation = 'source-over';
    
    if (waveformStroke) {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        drawWave('rgba(0,0,0,0.7)', 0, 0, 4.5);
        ctx.restore();
    }
    
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    drawWave(colors.primary, 0, 0, 2.5);

    // Original effect: Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 2);
    }
    
    // NEW effect: Vertical Roll
    if (isBeat && Math.random() > 0.7) {
        const rollAmount = Math.floor((Math.random() - 0.5) * height * 0.1);
        try {
            const imageData = ctx.getImageData(0, 0, width, height);
            ctx.clearRect(0, 0, width, height);
            ctx.putImageData(imageData, 0, rollAmount);
        } catch(e) { /* ignore */ }
    }

    // Modified effect: Block Corruption (replaces simple horizontal slip)
    if (isBeat) {
        const numBlocks = Math.floor(Math.random() * 4) + 1; // 1 to 4 blocks
        for (let i = 0; i < numBlocks; i++) {
            const sx = Math.random() * width * 0.9;
            const sy = Math.random() * height * 0.9;
            const sw = Math.random() * width * 0.3 + 10;
            const sh = Math.random() * height * 0.1 + 5;
            const dx = sx + (Math.random() - 0.5) * 60;
            const dy = sy + (Math.random() - 0.5) * 30;
            try {
                // We draw from the canvas onto itself to create the glitch
                ctx.drawImage(ctx.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
            } catch(e) { /* ignore */ }
        }
    }
    
    ctx.restore();
};

const drawMonstercatGlitch = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    // 1. Draw the base Monstercat visual
    drawMonstercat(ctx, dataArray, width, height, frame, sensitivity, colors, graphicEffect, isBeat, waveformStroke);

    // 2. Apply glitch effects on top if there's a beat
    if (isBeat) {
        ctx.save();
        // Vertical Roll
        if (Math.random() > 0.8) {
            const rollAmount = Math.floor((Math.random() - 0.5) * height * 0.05);
            try {
                // To prevent smearing, we must capture, clear, then redraw the original visual shifted.
                const imageData = ctx.getImageData(0, 0, width, height);
                ctx.clearRect(0, 0, width, height);
                ctx.putImageData(imageData, 0, rollAmount);
            } catch(e) { /* ignore */ }
        }

        // Block Corruption
        const numBlocks = Math.floor(Math.random() * 6) + 2;
        for (let i = 0; i < numBlocks; i++) {
            const sx = Math.random() * width * 0.9;
            const sy = Math.random() * height * 0.9;
            const sw = Math.random() * width * 0.25 + 10;
            const sh = Math.random() * height * 0.1 + 5;
            const dx = sx + (Math.random() - 0.5) * 40;
            const dy = sy; // Only horizontal displacement
            try {
                ctx.drawImage(ctx.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
            } catch(e) { /* ignore */ }
        }
        ctx.restore();
    }
};

// Module-level state for effects that need persistence across frames
const dataMoshState: { imageData: ImageData | null, framesLeft: number } = {
    imageData: null,
    framesLeft: 0,
};

const drawDataMosh = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    
    // If a mosh is active from a previous frame, draw the "ghost" frame first.
    // This creates the smearing/feedback effect.
    if (dataMoshState.framesLeft > 0 && dataMoshState.imageData) {
        ctx.putImageData(dataMoshState.imageData, 0, 0);
        dataMoshState.framesLeft--;
    }
    
    // Draw the main, live visual on top of the ghost (or on the clean canvas if no ghost)
    const centerY = height / 2;
    const wavePath = new Path2D();
    const sliceWidth = width / (dataArray.length * 0.5);
    let x = 0;
    for (let i = 0; i < dataArray.length * 0.5; i++) {
        const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
        const y = centerY + amp;
        if (i === 0) {
            wavePath.moveTo(x, y);
        } else {
            wavePath.lineTo(x, y);
        }
        x += sliceWidth;
    }
    
    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke(wavePath);
        ctx.restore();
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    ctx.stroke(wavePath);

    // If a beat happens, we capture the *current* result (ghost + live wave)
    // to be the *next* ghost frame, continuing the feedback loop.
    if (isBeat) {
        try {
            dataMoshState.imageData = ctx.getImageData(0, 0, width, height);
            dataMoshState.framesLeft = 5; // Linger for 5 frames
        } catch (e) { /* ignore */ }
    }

    ctx.restore();
};

const drawSignalScramble = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    
    // Base wave with intense chromatic aberration
    const centerY = height / 2;
    ctx.globalCompositeOperation = 'lighter';
    const intensity = isBeat ? 15 : 5;
    const drawSubWave = (color: string, offset: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const sliceWidth = width / (dataArray.length * 0.5);
        let x = 0;
        for (let i = 0; i < dataArray.length * 0.5; i++) {
            const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
            ctx.lineTo(x, centerY + amp + (Math.random() - 0.5) * offset);
            x += sliceWidth;
        }
        ctx.stroke();
    };
    drawSubWave('rgba(255, 0, 100, 0.6)', intensity);
    drawSubWave('rgba(0, 255, 255, 0.6)', intensity);
    ctx.globalCompositeOperation = 'source-over';
    
    // Main wave on top
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    const mainWavePath = new Path2D();
    let x = 0;
    const sliceWidth = width / (dataArray.length * 0.5);
    for (let i = 0; i < dataArray.length * 0.5; i++) {
        const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
        mainWavePath.lineTo(x, centerY + amp);
        x += sliceWidth;
    }
    ctx.stroke(mainWavePath);

    // Static, snow, and tracking lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 2, Math.random() * 2);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const y = height * Math.random();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Screen Tearing on beat
    if (isBeat && Math.random() > 0.5) {
        const tearY = Math.random() * height;
        const tearHeight = Math.random() * 50 + 20;
        const tearShift = (Math.random() - 0.5) * 80;
        try {
            ctx.drawImage(ctx.canvas, 0, tearY, width, tearHeight, tearShift, tearY, width, tearHeight);
        } catch(e) {}
    }

    ctx.restore();
};

// State for the Pixel Rain effect, kept separate to not interfere with other particle systems.
const pixelRainState: {
    particles: {
        x: number;
        y: number;
        vy: number;
        opacity: number;
        color: string;
        length: number;
    }[];
} = {
    particles: [],
};

const drawPixelSort = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    // 1. Always draw the base visual first. This provides the source for our particles.
    drawMonstercat(ctx, dataArray, width, height, frame, sensitivity, colors, graphicEffect, isBeat, waveformStroke);

    // 2. On a strong beat, sample the canvas and create new "rain" particles.
    if (isBeat) {
        try {
            // Reading from the canvas can be slow, but it's the most direct way to sample the generated visual.
            const imageData = ctx.getImageData(0, 0, width, height);
            const pixels = imageData.data;
            const step = 4; // Performance: check every Nth pixel.
            for (let y = 0; y < height; y += step) {
                for (let x = 0; x < width; x += step) {
                    const i = (y * width + x) * 4;
                    // Check alpha channel to ensure we're sampling a drawn pixel
                    if (pixels[i + 3] > 200) {
                        const brightness = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
                        // Spawn from bright areas with a bit of randomness
                        if (brightness > 120 && Math.random() > 0.92) {
                            pixelRainState.particles.push({
                                x: x,
                                y: y,
                                vy: Math.random() * 5 + 7, // High initial downward velocity for "fast" effect
                                opacity: 1,
                                color: `rgba(${pixels[i]}, ${pixels[i+1]}, ${pixels[i+2]}, 1)`,
                                length: Math.random() * 25 + 15, // Trail length
                            });
                        }
                    }
                }
            }
        } catch (e) {
            // This can happen if a cross-origin background image taints the canvas.
            console.warn("Pixel Sort effect was blocked from reading canvas data, likely due to a cross-origin image.");
        }
    }

    // 3. Update and draw all active particles.
    const gravity = 0.6; // Increased gravity for a faster feel
    ctx.lineCap = 'round';
    
    // Iterate backwards to safely remove items while looping
    for (let i = pixelRainState.particles.length - 1; i >= 0; i--) {
        const p = pixelRainState.particles[i];

        // Apply physics
        p.y += p.vy;
        p.vy += gravity;

        // Draw the particle as a motion-blurred trail
        ctx.strokeStyle = applyAlphaToColor(p.color, p.opacity);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.length);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Fade out
        p.opacity -= 0.02;

        // Remove particle if it's invisible or off-screen
        if (p.opacity <= 0 || (p.y - p.length) > height) {
            pixelRainState.particles.splice(i, 1);
        }
    }
};

const drawRepulsorField = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, particles?: Particle[]) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;

    // The particle updates happen in the main loop, so we just draw here.
    if (particles) {
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = applyAlphaToColor(p.color, p.opacity * 0.8);
            ctx.fill();
        });
    }

    // Draw central core
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const normalizedBass = bass / 255;
    const coreRadius = width * 0.02 + normalizedBass * 40 * sensitivity;

    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGradient.addColorStop(0, applyAlphaToColor(colors.accent, 0.9));
    coreGradient.addColorStop(0.5, applyAlphaToColor(colors.primary, 0.7));
    coreGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = coreGradient;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = isBeat ? 40 : 20;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
};

const drawAudioLandscape = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height * 0.6; // Push the horizon up
    const fov = width * 0.8; // Field of view
    
    // Grid properties
    const gridSizeX = 40;
    const gridSizeZ = 30;
    const spacing = width / gridSizeX * 1.2;
    const maxTerrainHeight = height * 0.2;

    const angle = frame * 0.002; // Slow rotation

    const project = (x3d: number, y3d: number, z3d: number) => {
        // Rotate around Y axis
        const rotX = x3d * Math.cos(angle) - z3d * Math.sin(angle);
        const rotZ = x3d * Math.sin(angle) + z3d * Math.cos(angle);
        
        const scale = fov / (fov + rotZ);
        const x2d = rotX * scale + centerX;
        const y2d = y3d * scale + centerY;
        return { x: x2d, y: y2d, scale };
    };

    ctx.strokeStyle = colors.primary;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 5;
    ctx.lineWidth = 1.5;

    for (let z = 0; z < gridSizeZ; z++) {
        ctx.beginPath();
        let firstPointProjected = null;

        for (let x = 0; x < gridSizeX; x++) {
            const dataIndex = Math.floor((x / gridSizeX) * (dataArray.length * 0.6));
            const terrainHeight = Math.pow(dataArray[dataIndex] / 255.0, 2) * maxTerrainHeight * sensitivity;
            
            const x3d = (x - gridSizeX / 2) * spacing;
            const y3d = -terrainHeight;
            const z3d = (z - gridSizeZ / 2) * spacing;

            const p = project(x3d, y3d, z3d);
            
            if (p.scale <= 0) continue; // Clip points behind the camera

            if (firstPointProjected === null) {
                ctx.moveTo(p.x, p.y);
                firstPointProjected = p;
            } else {
                ctx.lineTo(p.x, p.y);
            }
        }
        
        if (firstPointProjected) {
            const zProgress = z / gridSizeZ;
            const [startHue, endHue] = colors.hueRange;
            const hue = startHue + (zProgress * (endHue - startHue));
            const lightness = 40 + zProgress * 30;
            ctx.strokeStyle = `hsla(${hue}, 90%, ${lightness}%, ${1 - zProgress * 0.7})`;
            ctx.shadowColor = `hsla(${hue}, 90%, ${lightness}%, ${1 - zProgress * 0.7})`;
            ctx.stroke();
        }
    }
    
    ctx.restore();
};

const drawPianoVirtuoso = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, particles?: Particle[]) => {
    ctx.save();

    const keyboardHeight = height * 0.25; // Made keyboard slightly taller
    const keyboardY = height - keyboardHeight;

    // --- Keyboard Glow on Beat ---
    if (isBeat) {
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 40; // Increased glow
    }

    // --- Data Mapping ---
    const numWhiteKeys = 28;
    const whiteKeyWidth = width / numWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = keyboardHeight * 0.6;
    const keyDataPoints = Math.floor(dataArray.length * 0.7 / numWhiteKeys);

    const whiteKeyPresses = new Array(numWhiteKeys).fill(0);

    // --- Draw White Keys ---
    for (let i = 0; i < numWhiteKeys; i++) {
        let pressAmount = 0;
        const dataStart = i * keyDataPoints;
        const dataEnd = dataStart + keyDataPoints;
        for (let j = dataStart; j < dataEnd; j++) {
            pressAmount += dataArray[j] || 0;
        }
        pressAmount /= (keyDataPoints * 255); // Normalize
        whiteKeyPresses[i] = pressAmount;

        const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.1;

        const keyX = i * whiteKeyWidth;
        const keyYOffset = isPressed ? 2 : 0; // Key press down animation

        // Add gradient for 3D effect
        const whiteKeyGradient = ctx.createLinearGradient(keyX, keyboardY, keyX, keyboardY + keyboardHeight);
        whiteKeyGradient.addColorStop(0, isPressed ? '#bbb' : '#fff');
        whiteKeyGradient.addColorStop(1, isPressed ? '#999' : '#e0e0e0');

        ctx.fillStyle = whiteKeyGradient;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.fillRect(keyX, keyboardY + keyYOffset, whiteKeyWidth, keyboardHeight);
        ctx.strokeRect(keyX, keyboardY + keyYOffset, whiteKeyWidth, keyboardHeight);
    }

    // Reset shadow for subsequent drawings
    ctx.shadowBlur = 0;

    // --- Draw Black Keys ---
    const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0]; // C#, D#, F#, G#, A#
    for (let i = 0; i < numWhiteKeys - 1; i++) {
         const patternIndex = i % 7;
         if (blackKeyPattern[patternIndex] === 1) {
            const pressAmount = (whiteKeyPresses[i] + whiteKeyPresses[i+1]) / 2;
            const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.15;

            const keyX = (i + 1) * whiteKeyWidth - (blackKeyWidth / 2);
            const keyYOffset = isPressed ? 2 : 0;

            const blackKeyGradient = ctx.createLinearGradient(keyX, keyboardY, keyX, keyboardY + blackKeyHeight);
            blackKeyGradient.addColorStop(0, isPressed ? '#555' : '#333');
            blackKeyGradient.addColorStop(1, isPressed ? '#333' : '#000');

            ctx.fillStyle = blackKeyGradient;
            ctx.fillRect(keyX, keyboardY + keyYOffset, blackKeyWidth, blackKeyHeight);
         }
    }

    // --- Draw Particles (Musical Notes) ---
    if (particles) {
        particles.forEach(p => {
            const noteSymbols = ['♪', '♫', '♬', '♭', '♯'];
            const symbol = noteSymbols[Math.floor(p.angle * noteSymbols.length)];

            ctx.font = `bold ${p.radius}px "Arial"`;
            ctx.fillStyle = applyAlphaToColor(p.color, p.opacity);
            ctx.textAlign = 'center';

            // Add glow to particles
            ctx.shadowColor = applyAlphaToColor(p.color, p.opacity * 0.8);
            ctx.shadowBlur = 15;

            ctx.fillText(symbol, p.x, p.y);
        });
    }

    ctx.restore();
};

const drawSubtitles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentSubtitle: Subtitle | undefined,
    { fontSizeVw, fontFamily, color, effect, bgStyle, isBeat }: {
        fontSizeVw: number;
        fontFamily: string;
        color: string;
        effect: GraphicEffectType;
        bgStyle: SubtitleBgStyle;
        isBeat?: boolean;
    }
) => {
    if (!currentSubtitle || !currentSubtitle.text) return;
    
    ctx.save();
    
    const { text } = currentSubtitle;
    
    const fontSize = (fontSizeVw / 100) * width;
    ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    const positionX = width / 2;
    const positionY = height - (height * 0.08);

    const metrics = ctx.measureText(text);
    const textHeight = metrics.fontBoundingBoxAscent ?? fontSize;
    const textWidth = metrics.width;

    // Handle background for readability
    if (bgStyle !== SubtitleBgStyle.NONE) {
        const bgPaddingX = fontSize * 0.4;
        const bgPaddingY = fontSize * 0.2;
        const bgWidth = textWidth + bgPaddingX * 2;
        const bgHeight = textHeight + bgPaddingY * 2;
        const bgX = positionX - bgWidth / 2;
        const bgY = positionY - textHeight - bgPaddingY;
        
        ctx.fillStyle = bgStyle === SubtitleBgStyle.SOLID ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)';
        createRoundedRectPath(ctx, bgX, bgY, bgWidth, bgHeight, 5);
        ctx.fill();
    }

    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize * 0.1;
    
    const drawTextWithEffect = (offsetX = 0, offsetY = 0) => {
        ctx.fillText(text, positionX + offsetX, positionY + offsetY);
        if (effect === GraphicEffectType.STROKE) {
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.strokeText(text, positionX + offsetX, positionY + offsetY);
        }
    };

    // Handle text effects
    switch (effect) {
        case GraphicEffectType.GLOW:
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            break;
        case GraphicEffectType.SHADOW:
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = fontSize * 0.04;
            ctx.shadowOffsetY = fontSize * 0.04;
            break;
        case GraphicEffectType.GLITCH:
            if (isBeat) {
                ctx.globalCompositeOperation = 'lighter';
                const glitchAmount = fontSize * 0.1;
                ctx.fillStyle = 'rgba(255, 0, 100, 0.7)';
                drawTextWithEffect((Math.random() - 0.5) * glitchAmount, (Math.random() - 0.5) * glitchAmount);
                ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
                drawTextWithEffect((Math.random() - 0.5) * glitchAmount, (Math.random() - 0.5) * glitchAmount);
                ctx.globalCompositeOperation = 'source-over';
            }
            break;
    }
    
    ctx.fillStyle = color;
    drawTextWithEffect();
    
    ctx.restore();
};


const drawCustomText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    dataArray: Uint8Array,
    { width, height, color, fontFamily, graphicEffect, position, isBeat }: {
        width: number;
        height: number;
        color: string;
        fontFamily: string;
        graphicEffect: GraphicEffectType;
        position: WatermarkPosition;
        isBeat?: boolean;
    }
) => {
    if (!text) return;
    ctx.save();

    const paddingX = width * 0.025;
    const paddingY = height * 0.05;
    let positionX = 0, positionY = 0;
    
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const normalizedBass = bass / 255;
    const baseFontSize = position === WatermarkPosition.CENTER
        ? Math.min(width, height) * 0.1
        : Math.min(width, height) * 0.035;
    const pulseAmount = baseFontSize * 0.05;
    const fontSize = baseFontSize + (normalizedBass * pulseAmount);

    ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize * 0.1;

    switch (position) {
        case WatermarkPosition.BOTTOM_RIGHT:
            positionX = width - paddingX;
            positionY = height - paddingY;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            break;
        case WatermarkPosition.BOTTOM_LEFT:
            positionX = paddingX;
            positionY = height - paddingY;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            break;
        case WatermarkPosition.TOP_RIGHT:
            positionX = width - paddingX;
            positionY = paddingY;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            break;
        case WatermarkPosition.TOP_LEFT:
            positionX = paddingX;
            positionY = paddingY;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            break;
        case WatermarkPosition.CENTER:
            positionX = width / 2;
            positionY = height / 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            break;
    }

    const drawText = (offsetX = 0, offsetY = 0, customColor?: string) => {
        ctx.fillText(text, positionX + offsetX, positionY + offsetY);
        if (graphicEffect === GraphicEffectType.STROKE) {
            ctx.strokeStyle = customColor ? applyAlphaToColor(customColor, 0.5) : 'rgba(0,0,0,0.5)';
            ctx.strokeText(text, positionX + offsetX, positionY + offsetY);
        }
    };

    switch (graphicEffect) {
        case GraphicEffectType.GLOW:
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            drawText();
            ctx.shadowBlur = 10;
            drawText();
            break;
        case GraphicEffectType.SHADOW:
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = fontSize * 0.05;
            ctx.shadowOffsetY = fontSize * 0.05;
            break;
        case GraphicEffectType.GLITCH:
            if (isBeat) {
                ctx.globalCompositeOperation = 'lighter';
                const glitchAmount = fontSize * 0.1;
                ctx.fillStyle = 'rgba(255, 0, 100, 0.7)';
                drawText((Math.random() - 0.5) * glitchAmount, (Math.random() - 0.5) * glitchAmount);
                ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
                drawText((Math.random() - 0.5) * glitchAmount, (Math.random() - 0.5) * glitchAmount);
                ctx.globalCompositeOperation = 'source-over';
            }
            break;
    }
    
    // Draw the main text fill
    const gradient = ctx.createLinearGradient(0, positionY - fontSize, 0, positionY);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.8, color);
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    drawText();

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
    isBeat?: boolean,
    waveformStroke?: boolean,
    particles?: Particle[]
) => void;

const VISUALIZATION_MAP: Record<VisualizationType, DrawFunction> = {
    [VisualizationType.MONSTERCAT]: drawMonstercat,
    [VisualizationType.MONSTERCAT_GLITCH]: drawMonstercatGlitch,
    [VisualizationType.NEBULA_WAVE]: drawNebulaWave,
    [VisualizationType.LUMINOUS_WAVE]: drawLuminousWave,
    [VisualizationType.FUSION]: drawFusion,
    [VisualizationType.TECH_WAVE]: drawTechWave,
    [VisualizationType.STELLAR_CORE]: drawStellarCore,
    [VisualizationType.RADIAL_BARS]: drawRadialBars,
    [VisualizationType.PARTICLE_GALAXY]: drawParticleGalaxy,
    [VisualizationType.LIQUID_METAL]: drawLiquidMetal,
    [VisualizationType.CRT_GLITCH]: drawCrtGlitch,
    [VisualizationType.GLITCH_WAVE]: drawGlitchWave,
    [VisualizationType.DATA_MOSH]: drawDataMosh,
    [VisualizationType.SIGNAL_SCRAMBLE]: drawSignalScramble,
    [VisualizationType.PIXEL_SORT]: drawPixelSort,
    [VisualizationType.REPULSOR_FIELD]: drawRepulsorField,
    [VisualizationType.AUDIO_LANDSCAPE]: drawAudioLandscape,
    [VisualizationType.PIANO_VIRTUOSO]: drawPianoVirtuoso,
};

type Particle = {
    x: number;
    y: number;
    // Linear motion
    vx: number;
    vy: number;
    // Orbital motion
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


const AudioVisualizer = forwardRef<HTMLCanvasElement, AudioVisualizerProps>(({ analyser, audioRef, visualizationType, isPlaying, customText, textColor, fontFamily, graphicEffect, sensitivity, smoothing, equalization, backgroundColor, colors, backgroundImage, watermarkPosition, waveformStroke, subtitles, showSubtitles, subtitleFontSize, subtitleFontFamily, subtitleColor, subtitleEffect, subtitleBgStyle, effectScale, effectOffsetX, effectOffsetY }, ref) => {
    const animationFrameId = useRef<number>(0);
    const frame = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const shockwavesRef = useRef<Shockwave[]>([]);
    const backgroundImageRef = useRef<HTMLImageElement | null>(null);
    const beatCooldownRef = useRef<number>(0);

    // Use a ref to hold all dynamic props to prevent re-creating the render function.
    const propsRef = useRef({
        analyser, audioRef, visualizationType, isPlaying, customText, textColor, fontFamily,
        graphicEffect, sensitivity, smoothing, equalization, backgroundColor, colors,
        backgroundImage, watermarkPosition, waveformStroke, subtitles, showSubtitles,
        subtitleFontSize, subtitleFontFamily, subtitleColor, subtitleEffect, subtitleBgStyle,
        effectScale, effectOffsetX, effectOffsetY
    });
    propsRef.current = {
        analyser, audioRef, visualizationType, isPlaying, customText, textColor, fontFamily,
        graphicEffect, sensitivity, smoothing, equalization, backgroundColor, colors,
        backgroundImage, watermarkPosition, waveformStroke, subtitles, showSubtitles,
        subtitleFontSize, subtitleFontFamily, subtitleColor, subtitleEffect, subtitleBgStyle,
        effectScale, effectOffsetX, effectOffsetY
    };

    useEffect(() => {
        // Clear dynamic elements when visualization changes to prevent artifacts
        particlesRef.current = [];
        shockwavesRef.current = [];
        // Also clear stateful visualizer data
        dataMoshState.imageData = null;
        dataMoshState.framesLeft = 0;
        pixelRainState.particles = [];

    }, [visualizationType]);
    
    useEffect(() => {
        if (backgroundImage) {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Important for canvas tainted issues
            img.src = backgroundImage;
            img.onload = () => {
                backgroundImageRef.current = img;
            };
            img.onerror = () => {
                console.error("Failed to load background image.");
                backgroundImageRef.current = null;
            }
        } else {
            backgroundImageRef.current = null;
        }
    }, [backgroundImage]);

    const renderFrame = useCallback(() => {
        const {
            analyser, audioRef, visualizationType, customText, textColor, fontFamily,
            graphicEffect, sensitivity, smoothing, equalization, backgroundColor, colors,
            watermarkPosition, waveformStroke, subtitles, showSubtitles, subtitleFontSize,
            subtitleFontFamily, subtitleColor, subtitleEffect, subtitleBgStyle, effectScale,
            effectOffsetX, effectOffsetY
        } = propsRef.current;

        const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
        if (!canvas || !analyser) {
            animationFrameId.current = requestAnimationFrame(renderFrame);
            return;
        };

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        frame.current++;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const bassAvg = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
        let isBeat = false;
        if (bassAvg > 180 && beatCooldownRef.current <= 0) {
             isBeat = true;
             beatCooldownRef.current = 10; // Cooldown for 10 frames
        }
        if(beatCooldownRef.current > 0) beatCooldownRef.current--;

        const balancedData = equalizeDataArray(dataArray, equalization);
        const smoothedData = smoothDataArray(balancedData, smoothing);

        const { width, height } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;

        let finalColors = { ...colors };
        if (finalColors.name === ColorPaletteType.RAINBOW) {
            const currentHue = (frame.current * 0.1) % 360;
            finalColors = {
                ...finalColors,
                primary: `hsl(${currentHue}, 90%, 60%)`,
                secondary: `hsl(${(currentHue + 120) % 360}, 80%, 60%)`,
                accent: `hsl(${(currentHue + 40) % 360}, 100%, 80%)`,
                hueRange: [currentHue, currentHue + 80]
            };
        }

        if (backgroundColor === 'transparent') {
            ctx.clearRect(0, 0, width, height);
        } else {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }

        if (backgroundImageRef.current) {
            const img = backgroundImageRef.current;
            const canvasAspect = width / height;
            const imageAspect = img.width / img.height;
            let sx, sy, sWidth, sHeight;
            if (canvasAspect > imageAspect) {
                sWidth = img.width; sHeight = sWidth / canvasAspect; sx = 0; sy = (img.height - sHeight) / 2;
            } else {
                sHeight = img.height; sWidth = sHeight * canvasAspect; sy = 0; sx = (img.width - sWidth) / 2;
            }
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
        }

        const IGNORE_TRANSFORM_VISUALIZATIONS = new Set([
            VisualizationType.PIANO_VIRTUOSO,
            VisualizationType.CRT_GLITCH,
            VisualizationType.GLITCH_WAVE,
            VisualizationType.DATA_MOSH,
            VisualizationType.SIGNAL_SCRAMBLE,
            VisualizationType.PIXEL_SORT
        ]);

        const drawFunction = VISUALIZATION_MAP[visualizationType];
        if (drawFunction) {
            ctx.save();
            if (!IGNORE_TRANSFORM_VISUALIZATIONS.has(visualizationType)) {
                ctx.translate(centerX + effectOffsetX, centerY + effectOffsetY);
                ctx.scale(effectScale, effectScale);
                ctx.translate(-centerX, -centerY);
            }

            if (visualizationType === VisualizationType.STELLAR_CORE) {
                const bass = smoothedData.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
                const normalizedBass = bass / 255;
                const bgGlowRadius = Math.min(width, height) * 0.5 + normalizedBass * 50;
                const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bgGlowRadius);
                bgGradient.addColorStop(0, finalColors.backgroundGlow);
                bgGradient.addColorStop(1, 'rgba(10, 20, 40, 0)');
                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, width, height);
            }
            drawFunction(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, particlesRef.current);
            ctx.restore();
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
                            color: Math.random() > 0.3 ? finalColors.primary : finalColors.secondary,
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
                    ctx.fillStyle = applyAlphaToColor(p.color, p.opacity);
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
                            color: Math.random() > 0.5 ? finalColors.primary : finalColors.secondary,
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
                    const currentHue = (finalColors.hueRange[0] + (p.baseOrbitRadius / (width * 0.4)) * 60) % 360;
                    ctx.fillStyle = `hsla(${currentHue}, 90%, ${lightness}%, ${p.opacity})`;
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
                    
                    g.addColorStop(0, applyAlphaToColor(finalColors.primary, 1));
                    g.addColorStop(0.5, applyAlphaToColor(finalColors.secondary, 0.53));
                    g.addColorStop(1, applyAlphaToColor(finalColors.secondary, 0));

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
                    ctx.fillStyle = applyAlphaToColor(finalColors.accent, p.opacity);
                    ctx.fill();
                });
                particlesRef.current = particlesRef.current.filter(p => p.opacity > 0);
                
                // Spawn new particles based on effect
                if (visualizationType === VisualizationType.LUMINOUS_WAVE && Math.random() > 0.7) {
                    particlesRef.current.push({
                        x: centerX, y: centerY,
                        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                        radius: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.5 + 0.5,
                        angle: 0, orbitRadius: 0, baseOrbitRadius: 0, color: finalColors.accent, angleVelocity: 0,
                    });
                } else if (visualizationType === VisualizationType.FUSION) {
                    const bass = smoothedData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
                    if (bass > 160 && Math.random() > 0.6) {
                        for (let i = 0; i < 2; i++) {
                             particlesRef.current.push({
                                x: Math.random() * width, y: height,
                                vx: (Math.random() - 0.5) * 0.5, vy: -Math.random() * 1.5 - 0.5,
                                radius: Math.random() * 2 + 1, opacity: 1,
                                angle: 0, orbitRadius: 0, baseOrbitRadius: 0, color: finalColors.accent, angleVelocity: 0,
                            });
                        }
                    }
                }
            } else if (visualizationType === VisualizationType.REPULSOR_FIELD) {
                if (particlesRef.current.length === 0) {
                    const numParticles = 500;
                    for (let i = 0; i < numParticles; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = Math.random() * (width * 0.1); // Start near the center
                        particlesRef.current.push({
                            x: centerX + Math.cos(angle) * radius,
                            y: centerY + Math.sin(angle) * radius,
                            vx: (Math.random() - 0.5) * 15, // High initial velocity
                            vy: (Math.random() - 0.5) * 15, // High initial velocity
                            radius: Math.random() * 2 + 0.8, // Slightly larger particles
                            opacity: Math.random() * 0.6 + 0.4,
                            color: Math.random() > 0.3 ? finalColors.primary : finalColors.secondary,
                            angle: 0, orbitRadius: 0, baseOrbitRadius: 0, angleVelocity: 0,
                        });
                    }
                }

                const bass = smoothedData.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
                const normalizedBass = bass / 255;
                const boundaryRadius = 150;
                const repulsorStrength = isBeat ? normalizedBass * 80 : 0; // Increased strength

                particlesRef.current.forEach(p => {
                    const dx = p.x - centerX;
                    const dy = p.y - centerY;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);

                    // Repulsion force on beat
                    if (repulsorStrength > 0 && dist > 1) {
                        const forceX = (dx / dist) * repulsorStrength;
                        const forceY = (dy / dist) * repulsorStrength;
                        p.vx += forceX / 10; // Increased acceleration
                        p.vy += forceY / 10;
                    }
                    
                    p.x += p.vx;
                    p.y += p.vy;

                    // Boundary check and bounce
                    const newDist = Math.sqrt((p.x - centerX)**2 + (p.y - centerY)**2);
                    if (newDist > boundaryRadius) {
                        // Normal vector at the point of collision
                        const nx = (p.x - centerX) / newDist;
                        const ny = (p.y - centerY) / newDist;
                        
                        // Reflect velocity vector and apply energy loss
                        const dotProduct = p.vx * nx + p.vy * ny;
                        p.vx = (p.vx - 2 * dotProduct * nx) * 0.85; 
                        p.vy = (p.vy - 2 * dotProduct * ny) * 0.85;

                        // Place particle back on the boundary
                        p.x = centerX + nx * boundaryRadius;
                        p.y = centerY + ny * boundaryRadius;
                    }
                });
            } else if (visualizationType === VisualizationType.PIANO_VIRTUOSO) {
                const keyboardHeight = height * 0.25;
                const numWhiteKeys = 28;
                const whiteKeyWidth = width / numWhiteKeys;
                const keyDataPoints = Math.floor(smoothedData.length * 0.7 / numWhiteKeys);

                const whiteKeyPresses = new Array(numWhiteKeys).fill(0);

                // Calculate white key presses
                for (let i = 0; i < numWhiteKeys; i++) {
                    let pressAmount = 0;
                    const dataStart = i * keyDataPoints;
                    const dataEnd = dataStart + keyDataPoints;
                    for (let j = dataStart; j < dataEnd; j++) {
                        pressAmount += smoothedData[j] || 0;
                    }
                    whiteKeyPresses[i] = pressAmount / (keyDataPoints * 255);
                }

                // Spawn particles for white keys
                whiteKeyPresses.forEach((pressAmount, i) => {
                    const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.1;
                    if (isPressed && Math.random() > 0.8) { // Increased spawn rate
                        particlesRef.current.push({
                            x: i * whiteKeyWidth + whiteKeyWidth / 2,
                            y: height - keyboardHeight,
                            vy: -3 - (pressAmount * 6), // Faster initial velocity
                            vx: (Math.random() - 0.5) * 1.5,
                            opacity: 1,
                            radius: 25 + (pressAmount * 40), // Larger notes
                            color: finalColors.accent,
                            angle: Math.random(),
                            orbitRadius: 0, baseOrbitRadius: 0, angleVelocity: 0,
                        });
                    }
                });

                // Spawn particles for black keys
                const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0];
                for (let i = 0; i < numWhiteKeys - 1; i++) {
                    const patternIndex = i % 7;
                    if (blackKeyPattern[patternIndex] === 1) {
                        const pressAmount = (whiteKeyPresses[i] + whiteKeyPresses[i+1]) / 2;
                        const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.15;
                        if (isPressed && Math.random() > 0.8) {
                            particlesRef.current.push({
                                x: (i + 1) * whiteKeyWidth,
                                y: height - keyboardHeight,
                                vy: -3 - (pressAmount * 6),
                                vx: (Math.random() - 0.5) * 1.5,
                                opacity: 1,
                                radius: 25 + (pressAmount * 30),
                                color: finalColors.secondary,
                                angle: Math.random(),
                                orbitRadius: 0, baseOrbitRadius: 0, angleVelocity: 0,
                            });
                        }
                    }
                }

                // Update all piano particles
                particlesRef.current.forEach(p => {
                    p.y += p.vy;
                    p.x += p.vx;
                    p.vy += 0.08; // Slightly less gravity to fly longer
                    p.opacity -= 0.015; // Fade slower
                });
                particlesRef.current = particlesRef.current.filter(p => p.opacity > 0 && p.y < height + 100);
            }


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

        const currentTime = audioRef.current?.currentTime ?? 0;
        let currentSubtitle: Subtitle | undefined = undefined;
        if (showSubtitles && subtitles.length > 0) {
            for (let i = subtitles.length - 1; i >= 0; i--) {
                if (currentTime >= subtitles[i].time) {
                    currentSubtitle = subtitles[i];
                    break;
                }
            }
        }

        if (currentSubtitle) {
            drawSubtitles(ctx, width, height, currentSubtitle, {
                fontSizeVw: subtitleFontSize, fontFamily: subtitleFontFamily, color: subtitleColor,
                effect: subtitleEffect, bgStyle: subtitleBgStyle, isBeat,
            });
        }

        if (customText) {
            drawCustomText(ctx, customText, smoothedData, {
                width, height, color: textColor, fontFamily, graphicEffect,
                position: watermarkPosition, isBeat,
            });
        }

        animationFrameId.current = requestAnimationFrame(renderFrame);
    }, []);

    useEffect(() => {
        const { isPlaying } = propsRef.current;
        if (isPlaying) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = requestAnimationFrame(renderFrame);
        } else {
            cancelAnimationFrame(animationFrameId.current);
            // Redraw one last time when paused to show final state
            setTimeout(() => {
               if(!propsRef.current.isPlaying) renderFrame();
            }, 50); // A small delay to ensure state has settled
        }

        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [isPlaying, renderFrame]);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        if (!canvas) return;
        
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                 if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                }
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