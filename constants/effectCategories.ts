import { VisualizationType, EffectCategory, EffectInfo } from '../types';

export const EFFECT_CATEGORIES: EffectInfo[] = [
    // 基礎款 - 簡單、穩定、適合初學者
    {
        type: VisualizationType.MONSTERCAT,
        category: EffectCategory.BASIC,
        description: '經典的頻譜條視覺化，穩定可靠',
        difficulty: 'easy',
        performance: 'low',
        tags: ['頻譜', '經典', '穩定', '適合初學者']
    },
    {
        type: VisualizationType.NEBULA_WAVE,
        category: EffectCategory.BASIC,
        description: '柔和的波浪效果，視覺舒適',
        difficulty: 'easy',
        performance: 'low',
        tags: ['波浪', '柔和', '舒適', '基礎']
    },
    {
        type: VisualizationType.LUMINOUS_WAVE,
        category: EffectCategory.BASIC,
        description: '發光的波浪線條，簡潔美觀',
        difficulty: 'easy',
        performance: 'low',
        tags: ['發光', '線條', '簡潔', '美觀']
    },
    {
        type: VisualizationType.RADIAL_BARS,
        category: EffectCategory.BASIC,
        description: '放射狀頻譜條，視覺衝擊力強',
        difficulty: 'easy',
        performance: 'low',
        tags: ['放射狀', '頻譜', '衝擊力', '基礎']
    },

    // 進階款 - 中等複雜度，有特色效果
    {
        type: VisualizationType.MONSTERCAT_GLITCH,
        category: EffectCategory.ADVANCED,
        description: 'Monstercat基礎版加上故障效果',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['故障', '進階', '特色', '中等性能']
    },
    {
        type: VisualizationType.TECH_WAVE,
        category: EffectCategory.ADVANCED,
        description: '科技感脈衝波，未來科技風格',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['科技', '脈衝', '未來', '中等性能']
    },
    {
        type: VisualizationType.STELLAR_CORE,
        category: EffectCategory.ADVANCED,
        description: '恆星核心效果，宇宙科幻風格',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['恆星', '科幻', '宇宙', '中等性能']
    },
    {
        type: VisualizationType.REPULSOR_FIELD,
        category: EffectCategory.ADVANCED,
        description: '排斥力場粒子效果，物理模擬',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['粒子', '物理', '力場', '中等性能']
    },

    // 實驗款 - 高複雜度，創新效果
    {
        type: VisualizationType.DATA_MOSH,
        category: EffectCategory.EXPERIMENTAL,
        description: '數位熔接效果，視覺衝擊力極強',
        difficulty: 'hard',
        performance: 'high',
        tags: ['數位', '熔接', '衝擊', '高性能需求']
    },
    {
        type: VisualizationType.PIXEL_SORT,
        category: EffectCategory.EXPERIMENTAL,
        description: '像素排序風暴，抽象藝術風格',
        difficulty: 'hard',
        performance: 'high',
        tags: ['像素', '排序', '抽象', '高性能需求']
    },
    {
        type: VisualizationType.SIGNAL_SCRAMBLE,
        category: EffectCategory.EXPERIMENTAL,
        description: '訊號干擾效果，故障藝術風格',
        difficulty: 'hard',
        performance: 'high',
        tags: ['訊號', '干擾', '故障', '高性能需求']
    },
    {
        type: VisualizationType.AUDIO_LANDSCAPE,
        category: EffectCategory.EXPERIMENTAL,
        description: '音訊地貌，3D立體視覺效果',
        difficulty: 'hard',
        performance: 'high',
        tags: ['3D', '地貌', '立體', '高性能需求']
    },

    // 特殊款 - 獨特效果，特定用途
    {
        type: VisualizationType.PARTICLE_GALAXY,
        category: EffectCategory.SPECIAL,
        description: '完整星系效果，太陽系九大行星',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['星系', '太陽系', '行星', '教育']
    },
    {
        type: VisualizationType.LIQUID_METAL,
        category: EffectCategory.SPECIAL,
        description: '金屬花朵效果，液態金屬美學',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['金屬', '花朵', '液態', '美學']
    },
    {
        type: VisualizationType.CRT_GLITCH,
        category: EffectCategory.SPECIAL,
        description: 'CRT故障效果，復古電視風格',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['CRT', '復古', '電視', '故障']
    },
    {
        type: VisualizationType.GLITCH_WAVE,
        category: EffectCategory.SPECIAL,
        description: '故障波浪，掃描線復古風格',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['故障', '波浪', '掃描線', '復古']
    },
    {
        type: VisualizationType.FUSION,
        category: EffectCategory.SPECIAL,
        description: '融合效果，多種視覺元素結合',
        difficulty: 'hard',
        performance: 'high',
        tags: ['融合', '多元素', '複雜', '高性能需求']
    },
    {
        type: VisualizationType.PIANO_VIRTUOSO,
        category: EffectCategory.SPECIAL,
        description: '鋼琴演奏家，音樂鍵盤視覺化',
        difficulty: 'medium',
        performance: 'medium',
        tags: ['鋼琴', '鍵盤', '音樂', '教育']
    }
];

// 按類別分組的特效
export const EFFECTS_BY_CATEGORY = {
    [EffectCategory.BASIC]: EFFECT_CATEGORIES.filter(e => e.category === EffectCategory.BASIC),
    [EffectCategory.ADVANCED]: EFFECT_CATEGORIES.filter(e => e.category === EffectCategory.ADVANCED),
    [EffectCategory.EXPERIMENTAL]: EFFECT_CATEGORIES.filter(e => e.category === EffectCategory.EXPERIMENTAL),
    [EffectCategory.SPECIAL]: EFFECT_CATEGORIES.filter(e => e.category === EffectCategory.SPECIAL)
};

// 獲取特效信息的輔助函數
export const getEffectInfo = (type: VisualizationType): EffectInfo | undefined => {
    return EFFECT_CATEGORIES.find(e => e.type === type);
};

// 獲取類別名稱的輔助函數
export const getCategoryName = (category: EffectCategory): string => {
    const names = {
        [EffectCategory.BASIC]: '基礎款',
        [EffectCategory.ADVANCED]: '進階款',
        [EffectCategory.EXPERIMENTAL]: '實驗款',
        [EffectCategory.SPECIAL]: '特殊款'
    };
    return names[category];
};
