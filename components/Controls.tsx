import React from 'react';
import { VisualizationType, FontType } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';

interface ControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    isRecording: boolean;
    onRecordToggle: () => void;
    isLoading: boolean;
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
    customText: string;
    onTextChange: (text: string) => void;
    textColor: string;
    onTextColorChange: (color: string) => void;
    fontFamily: FontType;
    onFontFamilyChange: (font: FontType) => void;
    sensitivity: number;
    onSensitivityChange: (value: number) => void;
    smoothing: number;
    onSmoothingChange: (value: number) => void;
    equalization: number;
    onEqualizationChange: (value: number) => void;
    audioFile: File | null;
    videoUrl: string;
    videoExtension: string;
}

const Button: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string; disabled?: boolean }>> = ({ children, onClick, className = '', disabled=false }) => (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const Controls: React.FC<ControlsProps> = ({
    isPlaying,
    onPlayPause,
    isRecording,
    onRecordToggle,
    isLoading,
    visualizationType,
    onVisualizationChange,
    customText,
    onTextChange,
    textColor,
    onTextColorChange,
    fontFamily,
    onFontFamilyChange,
    sensitivity,
    onSensitivityChange,
    smoothing,
    onSmoothingChange,
    equalization,
    onEqualizationChange,
    audioFile,
    videoUrl,
    videoExtension
}) => {
    return (
        <div className="w-full max-w-7xl p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
                <Button onClick={onPlayPause} className="bg-cyan-600 hover:bg-cyan-500 text-white w-12 h-12 text-2xl !p-0">
                    <Icon path={isPlaying ? ICON_PATHS.PAUSE : ICON_PATHS.PLAY} className="w-6 h-6" />
                </Button>
                 <Button onClick={onRecordToggle} className={`${isRecording ? 'bg-red-500 hover:bg-red-400 animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}>
                    {isLoading ? 
                        <>
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            <span>Processing...</span>
                        </>
                        : <>
                            <Icon path={isRecording ? ICON_PATHS.RECORD_STOP : ICON_PATHS.RECORD_START} className="w-5 h-5" />
                            <span>{isRecording ? 'Stop' : 'Record'}</span>
                        </>
                    }
                </Button>
            </div>
            
            <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2">
                <div className="flex flex-col items-center">
                    <label htmlFor="vis-select" className="text-sm text-gray-400 mb-1">Style</label>
                    <select 
                        id="vis-select"
                        value={visualizationType} 
                        onChange={(e) => onVisualizationChange(e.target.value as VisualizationType)}
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        {Object.values(VisualizationType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                 <div className="flex flex-col items-center">
                    <label htmlFor="text-input" className="text-sm text-gray-400 mb-1">Center Text</label>
                    <input
                        id="text-input"
                        type="text"
                        value={customText}
                        onChange={(e) => onTextChange(e.target.value)}
                        placeholder="Your Text Here"
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none w-36 text-center"
                    />
                </div>
                 <div className="flex flex-col items-center">
                    <label htmlFor="font-select" className="text-sm text-gray-400 mb-1">Font</label>
                    <select
                        id="font-select"
                        value={fontFamily}
                        onChange={(e) => onFontFamilyChange(e.target.value as FontType)}
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none w-36"
                    >
                        {Object.values(FontType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <div className="flex flex-col items-center">
                    <label htmlFor="text-color-input" className="text-sm text-gray-400 mb-1">Text Color</label>
                    <input
                        id="text-color-input"
                        type="color"
                        value={textColor}
                        onChange={(e) => onTextColorChange(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md p-1 h-10 w-12 cursor-pointer"
                        aria-label="Center text color"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label htmlFor="sensitivity-slider" className="text-sm text-gray-400 mb-1">Sensitivity</label>
                    <input
                        id="sensitivity-slider"
                        type="range"
                        min="0.1"
                        max="2.5"
                        step="0.1"
                        value={sensitivity}
                        onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
                        className="w-32 cursor-pointer accent-cyan-500"
                        aria-label="Visualization sensitivity"
                    />
                </div>
                 <div className="flex flex-col items-center">
                    <label htmlFor="balance-slider" className="text-sm text-gray-400 mb-1">Balance</label>
                    <input
                        id="balance-slider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={equalization}
                        onChange={(e) => onEqualizationChange(parseFloat(e.target.value))}
                        className="w-32 cursor-pointer accent-cyan-500"
                        aria-label="Visualization frequency balance"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <label htmlFor="smoothing-slider" className="text-sm text-gray-400 mb-1">Smoothing</label>
                    <input
                        id="smoothing-slider"
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={smoothing}
                        onChange={(e) => onSmoothingChange(parseInt(e.target.value, 10))}
                        className="w-32 cursor-pointer accent-cyan-500"
                        aria-label="Visualization smoothing"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-3">
                 {audioFile && (
                    <a href={URL.createObjectURL(audioFile)} download={audioFile.name} className="px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white">
                        <Icon path={ICON_PATHS.DOWNLOAD} />
                        <span>Music</span>
                    </a>
                )}
                {videoUrl && (
                    <a href={videoUrl} download={`${audioFile?.name.replace(/\.[^/.]+$/, "") || 'visualization'}.${videoExtension}`} className="px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white">
                        <Icon path={ICON_PATHS.DOWNLOAD} />
                        <span>Video</span>
                    </a>
                )}
            </div>
        </div>
    );
};


export default Controls;