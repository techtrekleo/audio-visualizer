import React from 'react';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Resolution, GraphicEffectType } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import CategorizedEffectSelector from './CategorizedEffectSelector';

interface QuickSettingsPanelProps {
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
    colorPalette: ColorPaletteType;
    onColorPaletteChange: (palette: ColorPaletteType) => void;
    resolution: Resolution;
    onResolutionChange: (resolution: Resolution) => void;
    backgroundColor: BackgroundColorType;
    onBackgroundColorChange: (color: BackgroundColorType) => void;
    sensitivity: number;
    onSensitivityChange: (value: number) => void;
    smoothing: number;
    onSmoothingChange: (value: number) => void;
    customText: string;
    onTextChange: (text: string) => void;
    textColor: string;
    onTextColorChange: (color: string) => void;
    fontFamily: FontType;
    onFontFamilyChange: (font: FontType) => void;
}

const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
    visualizationType,
    onVisualizationChange,
    colorPalette,
    onColorPaletteChange,
    resolution,
    onResolutionChange,
    backgroundColor,
    onBackgroundColorChange,
    sensitivity,
    onSensitivityChange,
    smoothing,
    onSmoothingChange,
    customText,
    onTextChange,
    textColor,
    onTextColorChange,
    fontFamily,
    onFontFamilyChange,
}) => {
    const PRESET_COLORS = ['#FFFFFF', '#67E8F9', '#F472B6', '#FFD700', '#FF4500', '#A78BFA'];

    const FONT_MAP: Record<FontType, string> = {
        [FontType.POPPINS]: 'Poppins',
        [FontType.ORBITRON]: 'Orbitron',
        [FontType.LOBSTER]: 'Lobster',
        [FontType.BUNGEE]: 'Bungee',
        [FontType.PRESS_START_2P]: 'Press Start 2P',
        [FontType.PACIFICO]: 'Pacifico',
        [FontType.DANCING_SCRIPT]: 'Dancing Script',
        [FontType.ROCKNROLL_ONE]: '搖滾圓體',
        [FontType.REGGAE_ONE]: '雷鬼 Stencil',
        [FontType.VT323]: '立體裝甲',
    };

    const SwatchButton: React.FC<{
        color: string;
        onClick: (color: string) => void;
        isActive: boolean;
    }> = ({ color, onClick, isActive }) => (
        <button
            type="button"
            onClick={() => onClick(color)}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400 hover:scale-110 ${
                isActive ? 'border-white scale-110 shadow-lg' : 'border-gray-600 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Set text color to ${color}`}
        />
    );

    return (
        <div className="quick-settings-panel bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/30">
            <div className="flex items-center space-x-2 mb-4">
                <Icon path={ICON_PATHS.STAR} className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-gray-200">快速設置</h3>
                <span className="px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full">
                    常用選項
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 視覺效果選擇 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">視覺效果</label>
                    <CategorizedEffectSelector
                        currentType={visualizationType}
                        onTypeChange={onVisualizationChange}
                    />
                </div>

                {/* 顏色主題 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">顏色主題</label>
                    <select
                        value={colorPalette}
                        onChange={(e) => onColorPaletteChange(e.target.value as ColorPaletteType)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                    >
                        {Object.values(ColorPaletteType).map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>

                {/* 解析度 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">解析度</label>
                    <select
                        value={resolution}
                        onChange={(e) => onResolutionChange(e.target.value as Resolution)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                    >
                        {Object.values(Resolution).map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>

                {/* 背景顏色 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">背景顏色</label>
                    <select
                        value={backgroundColor}
                        onChange={(e) => onBackgroundColorChange(e.target.value as BackgroundColorType)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                    >
                        {Object.values(BackgroundColorType).map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>

                {/* 自訂文字 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">自訂文字</label>
                    <input
                        type="text"
                        value={customText}
                        onChange={(e) => onTextChange(e.target.value)}
                        placeholder="輸入文字..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                    />
                </div>

                {/* 字體選擇 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">字體</label>
                    <select
                        value={fontFamily}
                        onChange={(e) => onFontFamilyChange(e.target.value as FontType)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                    >
                        {Object.entries(FONT_MAP).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 音頻響應控制 */}
            <div className="mt-4 pt-4 border-t border-gray-600/50">
                <h4 className="text-sm font-medium text-gray-300 mb-3">音頻響應</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">靈敏度</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{sensitivity.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min={0.1}
                            max={3.0}
                            step={0.1}
                            value={sensitivity}
                            onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">平滑度</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{smoothing}</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={10}
                            step={1}
                            value={smoothing}
                            onChange={(e) => onSmoothingChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>
                </div>
            </div>

            {/* 文字顏色 */}
            <div className="mt-4 pt-4 border-t border-gray-600/50">
                <h4 className="text-sm font-medium text-gray-300 mb-3">文字顏色</h4>
                <div className="flex space-x-2">
                    {PRESET_COLORS.map(color => (
                        <SwatchButton
                            key={color}
                            color={color}
                            onClick={onTextColorChange}
                            isActive={textColor === color}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickSettingsPanel;
