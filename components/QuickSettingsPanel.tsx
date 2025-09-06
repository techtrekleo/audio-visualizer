import React from 'react';
import { VisualizationType } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import CategorizedEffectSelector from './CategorizedEffectSelector';

interface QuickSettingsPanelProps {
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
    waveformStroke: boolean;
    onWaveformStrokeChange: (value: boolean) => void;
    effectScale: number;
    onEffectScaleChange: (value: number) => void;
    effectOffsetX: number;
    onEffectOffsetXChange: (value: number) => void;
    effectOffsetY: number;
    onEffectOffsetYChange: (value: number) => void;
    isRecording: boolean;
}

const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
    visualizationType,
    onVisualizationChange,
    waveformStroke,
    onWaveformStrokeChange,
    effectScale,
    onEffectScaleChange,
    effectOffsetX,
    onEffectOffsetXChange,
    effectOffsetY,
    onEffectOffsetYChange,
    isRecording,
}) => {
    return (
        <div className="quick-settings-panel bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/30">
            <div className="flex items-center space-x-2 mb-4">
                <Icon path={ICON_PATHS.STAR} className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-gray-200">快速設置</h3>
                <span className="px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full">
                    視覺效果
                </span>
            </div>
            
            <div className="space-y-4">
                {/* 視覺效果選擇 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">選擇視覺效果</label>
                    <CategorizedEffectSelector
                        currentType={visualizationType}
                        onTypeChange={onVisualizationChange}
                    />
                </div>

                {/* 進階控制選項 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* 聲波描邊 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">聲波描邊</label>
                        <button
                            onClick={() => onWaveformStrokeChange(!waveformStroke)}
                            disabled={isRecording}
                            type="button"
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${waveformStroke ? 'bg-cyan-600' : 'bg-gray-600'}`}
                            aria-pressed={waveformStroke}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${waveformStroke ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* 特效大小 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">特效大小</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{effectScale.toFixed(2)}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #6b7280 0%,
                                        #10b981 50%,
                                        #f59e0b 100%)`
                                }}
                            />
                            <input
                                type="range"
                                min={0.1}
                                max={2.0}
                                step={0.05}
                                value={effectScale}
                                onChange={(e) => onEffectScaleChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                style={{ background: 'transparent' }}
                            />
                            <div
                                className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectScale - 0.1) / (2.0 - 0.1)) * 100}%`,
                                    transition: 'width 0.1s ease'
                                }}
                            />
                        </div>
                    </div>

                    {/* 水平位移 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">水平位移</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{effectOffsetX}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #3b82f6 0%,
                                        #8b5cf6 50%,
                                        #ec4899 100%)`
                                }}
                            />
                            <input
                                type="range"
                                min={-500}
                                max={500}
                                step={10}
                                value={effectOffsetX}
                                onChange={(e) => onEffectOffsetXChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                style={{ background: 'transparent' }}
                            />
                            <div
                                className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectOffsetX - (-500)) / (500 - (-500))) * 100}%`,
                                    transition: 'width 0.1s ease'
                                }}
                            />
                        </div>
                    </div>

                    {/* 垂直位移 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">垂直位移</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{effectOffsetY}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #3b82f6 0%,
                                        #8b5cf6 50%,
                                        #ec4899 100%)`
                                }}
                            />
                            <input
                                type="range"
                                min={-500}
                                max={500}
                                step={10}
                                value={effectOffsetY}
                                onChange={(e) => onEffectOffsetYChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                style={{ background: 'transparent' }}
                            />
                            <div
                                className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectOffsetY - (-500)) / (500 - (-500))) * 100}%`,
                                    transition: 'width 0.1s ease'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickSettingsPanel;
