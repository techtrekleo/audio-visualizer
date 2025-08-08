
import React, { useRef, useEffect, forwardRef } from 'react';
import { VisualizationType, Palette, TextEffectType, ColorPaletteType } from '../types';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    visualizationType: VisualizationType;
    isPlaying: boolean;
    customText: string;
    textColor: string;
    fontFamily: string;
    textEffect: TextEffectType;
    sensitivity: number;
    smoothing: number;
    equalization: number;
    backgroundColor: string;
    colors: Palette;
}

// Helper function to draw a rectangle with rounded corners
const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
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
    ctx.fill();
};


const drawMonstercat = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, isBeat?: boolean) => {
    ctx.save();
    
    const numBars = 128;
    const dataSliceEnd = Math.floor(dataArray.length * 0.7);
    const barWidth = width / numBars;
    const centerY = height / 2;
    const maxHeight = height * 0.45; // Max height for one side
    
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;

    for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * dataSliceEnd);
        const amplitude = dataArray[dataIndex] / 255.0;
        const barHeight = Math.pow(amplitude, 2.5) * maxHeight * sensitivity;

        if (barHeight < 2) continue; // Skip drawing bars that are too small
        
        const x = i * barWidth;
        
        let color;
        if (colors.name === ColorPaletteType.WHITE) {
            const lightness = 85 + (amplitude * 15); // Vary lightness from 85% to 100%
            color = `hsl(220, 10%, ${lightness}%)`; // Use a cool, desaturated white
        } else {
            const hue = startHue + ((i / numBars) * hueRangeSpan);
            const saturation = isBeat ? 100 : 90;
            const lightness = 60;
            color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = isBeat ? 10 : 5;

        const barGap = 2; // px
        const effectiveBarWidth = barWidth - barGap;
        const cornerRadius = Math.min(4, effectiveBarWidth / 3);

        // Draw top bar (moving upwards from center)
        drawRoundedRect(ctx, x + barGap / 2, centerY - barHeight, effectiveBarWidth, barHeight, cornerRadius);
        
        // Draw bottom bar (moving downwards from center)
        drawRoundedRect(ctx, x + barGap / 2, centerY, effectiveBarWidth, barHeight, cornerRadius);
    }
    
    ctx.restore();
};

const drawLuminousWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, isBeat?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const maxAmplitude = height * 0.35;

    // 1. Draw central light beam
    const beamGradient = ctx.createLinearGradient(0, centerY, width, centerY);
    beamGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    beamGradient.addColorStop(0.2, `${colors.accent}40`); // 25% opacity
    beamGradient.addColorStop(0.5, colors.accent);
    beamGradient.addColorStop(0.8, `${colors.accent}40`);
    beamGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = beamGradient;
    ctx.shadowBlur = 30;
    ctx.shadowColor = colors.accent;
    ctx.fillRect(0, centerY - 2, width, 4);
    
    // 2. Setup for the mirrored waves
    const waveGradient = ctx.createLinearGradient(centerX, centerY - maxAmplitude, centerX, centerY + maxAmplitude);
    waveGradient.addColorStop(0, `${colors.secondary}cc`); // 80% opacity
    waveGradient.addColorStop(0.4, colors.primary);
    waveGradient.addColorStop(0.5, colors.accent);
    waveGradient.addColorStop(0.6, colors.primary);
    waveGradient.addColorStop(1, `${colors.secondary}cc`);

    ctx.strokeStyle = waveGradient;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.primary;

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
             // Draw the last segment to the final point
            ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);
            ctx.stroke();
        };

        drawCurve(topPoints);
        drawCurve(bottomPoints);
    };

    drawMirroredBezierWave('left');
    drawMirroredBezierWave('right');
    
    ctx.restore();
};

const drawFusion = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, isBeat?: boolean) => {
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;

    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;

    // --- 1. Draw dotted columns from the bottom ---
    const numColumns = 128;
    const columnSpacingX = width / numColumns;
    ctx.shadowBlur = 5;

    for (let i = 0; i < numColumns; i++) {
        const dataIndex = Math.floor(i * (dataArray.length * 0.7 / numColumns));
        // Use a power function to make the effect more sensitive to louder sounds
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
        
        const x = i * columnSpacingX + columnSpacingX / 2;
        
        const dotSpacingY = 8;
        const numDots = Math.floor(columnHeight / dotSpacingY);

        for (let j = 0; j < numDots; j++) {
            const y = height - j * dotSpacingY;
            // Fade out dots at the top of the column
            const opacity = 1 - Math.pow(j / numDots, 2);
            ctx.globalAlpha = opacity;
            
            ctx.beginPath();
            // Radius is based on amplitude, making loud parts have bigger dots
            const radius = 1 + (dataArray[dataIndex] / 255) * 1.5;
            ctx.arc(x, y - dotSpacingY / 2, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // Reset global alpha and shadowBlur for the next drawing operations
    ctx.globalAlpha = 1.0;
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
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
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
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
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

const drawNebulaWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, isBeat?: boolean) => {
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;

    // --- Create Mirrored Base Wave Data ---
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

    // --- Draw the overlapping waves with different amplitudes ---

    // Sensitivity multipliers for each wave
    const solidWaveAmpMultiplier = 0.6; // Less sensitive
    const dottedWaveAmpMultiplier = 1.2; // More sensitive, will have bigger amplitude

    // Draw Solid Wave (Less Sensitive)
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
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
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
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

const drawTechWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, isBeat?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.15;
    const bars = 128;
    
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;
    
    let color;
    if (colors.name === ColorPaletteType.WHITE) {
        color = colors.primary; // Use a single solid color for the white theme
    } else {
        const hue = startHue + ((frame / 2) % hueRangeSpan);
        color = `hsl(${hue}, 80%, 60%)`;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;

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

const drawStellarCore = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, isBeat?: boolean) => {
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
    
    // 2. Frequency "Tendrils" using Bezier Curves
    const spikes = 180;
    const spikeBaseRadius = Math.min(width, height) * 0.15;
    ctx.strokeStyle = colors.primary;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 1.5;

    for (let i = 0; i < spikes; i++) {
        const dataIndex = Math.floor((i / spikes) * (dataArray.length * 0.5));
        const spikeHeight = Math.pow(dataArray[dataIndex] / 255, 1.8) * 150 * sensitivity;
        if (spikeHeight < 1) continue;
        
        const angle = (i / spikes) * Math.PI * 2;
        
        // Start point on the base circle
        const x1 = centerX + Math.cos(angle) * spikeBaseRadius;
        const y1 = centerY + Math.sin(angle) * spikeBaseRadius;

        // End point at the tip of the tendril
        const x2 = centerX + Math.cos(angle) * (spikeBaseRadius + spikeHeight);
        const y2 = centerY + Math.sin(angle) * (spikeBaseRadius + spikeHeight);

        // Control point to create the curve
        // Place it halfway along the spike, but shifted perpendicularly to create a swirl
        const controlPointRadius = spikeBaseRadius + spikeHeight / 2;
        const swirlAngle = angle + Math.PI / 2; // Perpendicular direction
        // The amount of swirl will have a base value and an oscillating part for a more organic feel
        const swirlAmount = (spikeHeight / 10) + Math.sin(frame * 0.05 + i * 0.1) * 10;

        const controlX = centerX + Math.cos(angle) * controlPointRadius + Math.cos(swirlAngle) * swirlAmount;
        const controlY = centerY + Math.sin(angle) * controlPointRadius + Math.sin(swirlAngle) * swirlAmount;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(controlX, controlY, x2, y2);
        ctx.stroke();
    }
    
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


const drawRadialBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, frame: number, sensitivity: number, colors: Palette, isBeat?: boolean) => {
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;

    const color = isBeat ? colors.accent : colors.primary;

    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;

    const innerRadius = Math.min(width, height) * 0.22;
    const outerRadius = innerRadius + (width * 0.015);

    // --- Inner Circle (Bass spikes pointing INWARDS, now thinner) ---
    const innerSpikes = 128; // Increased for a spikier look
    const maxInnerHeight = Math.min(width, height) * 0.08; // Reduced amplitude
    
    ctx.lineWidth = 2; // Thinner lines, same as outer circle

    for (let i = 0; i < innerSpikes; i++) {
        // Still reacting to bass frequencies (lower part of dataArray)
        const dataIndex = Math.floor(i / innerSpikes * 64); // Sample from bass range
        const spikeHeight = Math.pow(dataArray[dataIndex] / 255, 2) * maxInnerHeight * sensitivity;
        if (spikeHeight < 1) continue;
        
        const angle = (i / innerSpikes) * Math.PI * 2 - Math.PI / 2;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * (innerRadius - spikeHeight);
        const y2 = centerY + Math.sin(angle) * (innerRadius - spikeHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // --- Outer Circle (Treble spikes pointing OUTWARDS, more exaggerated) ---
    const outerSpikes = 128;
    const maxOuterHeight = Math.min(width, height) * 0.28; // Increased amplitude significantly

    ctx.lineWidth = 2;
    
    for (let i = 0; i < outerSpikes; i++) {
        const dataIndex = Math.floor(100 + (i / outerSpikes) * (dataArray.length / 4));
        // Using a stronger power function to make spikes more dramatic
        const spikeHeight = Math.pow(dataArray[dataIndex] / 255, 1.5) * maxOuterHeight * sensitivity;
        if (spikeHeight < 1) continue;

        const angle = (i / outerSpikes) * Math.PI * 2 - Math.PI / 2;

        const x1 = centerX + Math.cos(angle) * outerRadius;
        const y1 = centerY + Math.sin(angle) * outerRadius;
        const x2 = centerX + Math.cos(angle) * (outerRadius + spikeHeight);
        const y2 = centerY + Math.sin(angle) * (outerRadius + spikeHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
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
    fontFamily: string,
    textEffect: TextEffectType
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

    // 2. Draw Shadow (if selected)
    if (textEffect === TextEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Draw only the shadow, not the fill
        ctx.fillText(text, centerX, centerY);
        
        // Reset shadow for next layers
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    // 3. Draw Neon Glow Layers (background auras)
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
    
    // 4. Draw Stroke (if selected)
    if (textEffect === TextEffectType.STROKE) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = fontSize * 0.04;
        ctx.strokeText(text, centerX, centerY);
    }
    
    // 5. Draw the main text fill on top of everything
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
};

type Particle = {
    x: number;
    y: number;
    // Linear motion (for Fusion, Luminous Wave)
    vx: number;
    vy: number;
    // Orbital motion (for Stellar Core)
    angle: number;
    orbitRadius: number;
    baseOrbitRadius: number;
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


const AudioVisualizer = forwardRef<HTMLCanvasElement, AudioVisualizerProps>(({ analyser, visualizationType, isPlaying, customText, textColor, fontFamily, textEffect, sensitivity, smoothing, equalization, backgroundColor, colors }, ref) => {
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
                drawFunction(ctx, smoothedData, width, height, frame.current, sensitivity, colors, isBeat);
            }
            
            // --- Handle Dynamic Elements (Particles, Shockwaves) ---
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
                        });
                    }
                }
                
                // Update and draw orbital particles
                const midFrequencies = smoothedData.slice(32, 96).reduce((a, b) => a + b, 0) / 64;
                const orbitFlux = (midFrequencies / 255) * 30 * sensitivity;

                particlesRef.current.forEach(p => {
                    p.angle += 0.005;
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
                    shockwavesRef.current.push({
                        radius: Math.min(width, height) * 0.15,
                        opacity: 1,
                        lineWidth: 3
                    });
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
                        angle: 0, orbitRadius: 0, baseOrbitRadius: 0, color: colors.accent
                    });
                } else if (visualizationType === VisualizationType.FUSION) {
                    const bass = smoothedData.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
                    if (bass > 160 && Math.random() > 0.6) {
                        for (let i = 0; i < 2; i++) {
                             particlesRef.current.push({
                                x: Math.random() * width, y: height,
                                vx: (Math.random() - 0.5) * 0.5, vy: -Math.random() * 1.5 - 0.5,
                                radius: Math.random() * 2 + 1, opacity: 1,
                                angle: 0, orbitRadius: 0, baseOrbitRadius: 0, color: colors.accent
                            });
                        }
                    }
                }
            }


            if (customText) {
                drawPulsingText(ctx, customText, smoothedData, width, height, textColor, fontFamily, textEffect);
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
    }, [isPlaying, analyser, visualizationType, ref, customText, textColor, fontFamily, textEffect, sensitivity, smoothing, equalization, backgroundColor, colors]);

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