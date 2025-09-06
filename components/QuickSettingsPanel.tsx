import React from 'react';
import { VisualizationType } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import CategorizedEffectSelector from './CategorizedEffectSelector';

interface QuickSettingsPanelProps {
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
}

const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
    visualizationType,
    onVisualizationChange,
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
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">選擇視覺效果</label>
                <CategorizedEffectSelector
                    currentType={visualizationType}
                    onTypeChange={onVisualizationChange}
                />
            </div>
        </div>
    );
};

export default QuickSettingsPanel;
