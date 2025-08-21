import React, { useState } from 'react';
import { VisualizationType, EffectCategory } from '../types';
import { EFFECTS_BY_CATEGORY, getCategoryName, getEffectInfo } from '../constants/effectCategories';

interface CategorizedEffectSelectorProps {
  currentType: VisualizationType;
  onTypeChange: (type: VisualizationType) => void;
}

const CategorizedEffectSelector: React.FC<CategorizedEffectSelectorProps> = ({
  currentType,
  onTypeChange
}) => {
  const [activeCategory, setActiveCategory] = useState<EffectCategory>(EffectCategory.BASIC);
  const [showTags, setShowTags] = useState<boolean>(false);

  const categories = Object.values(EffectCategory);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '簡單';
      case 'medium': return '中等';
      case 'hard': return '困難';
      default: return '未知';
    }
  };

  const getPerformanceText = (performance: string) => {
    switch (performance) {
      case 'low': return '低';
      case 'medium': return '中';
      case 'high': return '高';
      default: return '未知';
    }
  };

  return (
    <div className="categorized-effect-selector bg-gray-800 rounded-lg p-4 mb-4">
      {/* 分類標籤頁 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeCategory === category
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* 特效網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EFFECTS_BY_CATEGORY[activeCategory]?.map((effect) => {
          const isSelected = currentType === effect.type;
          return (
            <div
              key={effect.type}
              className={`effect-card bg-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-900/30'
                  : 'hover:bg-gray-600'
              }`}
              onClick={() => onTypeChange(effect.type)}
            >
              {/* 特效標題 */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {effect.type}
                </h3>
                {isSelected && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* 特效描述 */}
              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                {effect.description}
              </p>

              {/* 難度和性能指標 */}
              <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">難度:</span>
                  <span className={`font-medium ${getDifficultyColor(effect.difficulty)}`}>
                    {getDifficultyText(effect.difficulty)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">性能:</span>
                  <span className={`font-medium ${getPerformanceColor(effect.performance)}`}>
                    {getPerformanceText(effect.performance)}
                  </span>
                </div>
              </div>

              {/* 標籤 */}
              <div className="flex flex-wrap gap-1">
                {effect.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {effect.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                    +{effect.tags.length - 3}
                  </span>
                )}
              </div>

              {/* 選擇指示器 */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-center text-blue-400 text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    已選擇
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 分類說明 */}
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-3">
          📚 {getCategoryName(activeCategory)} 說明
        </h4>
        <div className="text-gray-300 text-sm leading-relaxed">
          {activeCategory === EffectCategory.BASIC && (
            <p>
              基礎款特效適合初學者使用，性能需求低，視覺效果穩定可靠。
              這些特效通常具有經典的視覺風格，適合日常使用和學習。
            </p>
          )}
          {activeCategory === EffectCategory.ADVANCED && (
            <p>
              進階款特效在基礎款之上增加了更多特色效果，中等複雜度。
              適合有一定經驗的用戶，在視覺衝擊力和性能之間取得平衡。
            </p>
          )}
          {activeCategory === EffectCategory.EXPERIMENTAL && (
            <p>
              實驗款特效具有創新性和高複雜度，視覺衝擊力極強。
              性能需求較高，適合追求極致視覺效果的用戶和高性能設備。
            </p>
          )}
          {activeCategory === EffectCategory.SPECIAL && (
            <p>
              特殊款特效具有獨特的功能和風格，適合特定用途和場合。
              包括教育類、美學類和復古風格等，為用戶提供多樣化選擇。
            </p>
          )}
        </div>
      </div>

      {/* 快速切換按鈕 */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setShowTags(!showTags)}
          className="px-3 py-2 bg-gray-600 text-gray-300 rounded-lg text-sm hover:bg-gray-500 transition-colors"
        >
          {showTags ? '隱藏標籤' : '顯示標籤'} 🏷️
        </button>
        <button
          onClick={() => setActiveCategory(EffectCategory.BASIC)}
          className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 transition-colors"
        >
          快速切換到基礎款 🚀
        </button>
      </div>
    </div>
  );
};

export default CategorizedEffectSelector;
