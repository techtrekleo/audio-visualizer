# 🎵 音訊視覺化工具 Pro

這是一個使用 React、TypeScript 和 Tailwind CSS 建構的即時音訊視覺化工具。您可以上傳音訊檔案，選擇各種視覺化風格，自訂外觀，並將輸出錄製為影片檔案。此版本使用 Gemini API 進行 AI 驅動的字幕生成。

## ✨ 功能特色

- **🎨 多種視覺化風格**：從 'Monstercat'、'Luminous Wave'、'Fusion' 等多種風格中選擇
- **🤖 AI 字幕生成**：使用 Gemini API 從您的音訊自動生成時間同步的字幕（[00:00.00] 格式）
- **⚡ 即時自訂**：即時調整靈敏度、平衡、平滑度、文字、字體和顏色
- **🎬 影片錄製**：將畫布動畫與音訊結合錄製成可下載的 MP4/WebM 檔案
- **📱 響應式設計**：完美支援桌面和行動裝置
- **🎯 高品質輸出**：支援多種解析度（720p、1080p、4K）

## 🚀 設定與運行

按照以下步驟在您的電腦上設定專案，用於開發、部署或作為 Chrome 擴充功能使用。

### 📋 環境需求

- **[Node.js](https://nodejs.org/)**：建議使用 LTS（長期支援）版本。包含 `npm`
- **[Git](https://git-scm.com/)**：用於複製倉庫
- **Gemini API Key**：您需要從 [Google AI Studio](https://aistudio.google.com/app/apikey) 獲取 API 金鑰

### 📝 逐步指南

1. **複製倉庫：**
   ```bash
   git clone https://github.com/techtrekleo/audio-visualizer.git
   cd audio-visualizer-repo
   ```

2. **安裝依賴：**
   此命令會下載所有必要的函式庫。
   ```bash
   npm install
   ```

3. **創建環境檔案：**
   在專案資料夾的根目錄創建一個名為 `.env` 的新檔案。將您的 Gemini API 金鑰添加到此檔案中。**名稱必須是 `VITE_API_KEY`**。
   ```
   VITE_API_KEY=您的_GEMINI_API_金鑰
   ```
   將 `您的_GEMINI_API_金鑰` 替換為您的實際金鑰。此檔案被 Git 忽略，保持您的金鑰私密。

4. **本地開發運行：**
   這將啟動本地伺服器。在終端機中開啟顯示的 URL（通常是 `http://localhost:5173`）。
   ```bash
   npm run dev
   ```

## 🎨 視覺化風格

### 基礎風格
- **Monstercat** - 經典的 Monstercat 風格
- **Monstercat (新版)** - 改進的 Monstercat 視覺效果
- **Monstercat (故障版)** - 帶有故障效果的版本

### 進階風格
- **Nebula Wave** - 星雲波浪效果
- **Luminous Wave** - 發光波浪
- **Fusion** - 融合多種效果
- **量子脈衝 (Quantum Pulse)** - 科技感量子效果
- **Stellar Core** - 恆星核心效果

### 特殊風格
- **水波漣漪 (Water Ripple)** - 水波擴散效果
- **Radial Bars** - 徑向條形圖
- **完整星系 (Full Galaxy)** - 完整星系粒子系統
- **金屬花朵 (Metal Flower)** - 金屬花朵效果

### 實驗風格
- **CRT Glitch** - CRT 故障效果
- **Glitch Wave** - 故障波浪
- **數位熔接 (Digital Mosh)** - 數位熔接效果
- **訊號干擾 (Signal Scramble)** - 訊號干擾效果
- **數位風暴 (Digital Storm)** - 數位風暴效果
- **排斥力場 (Repulsion Field)** - 排斥力場效果
- **音訊地貌** - 音訊地形效果
- **鋼琴演奏家** - 鋼琴專用視覺效果

## 🎛️ 自訂選項

### 視覺設定
- **文字自訂**：自訂顯示文字和字體
- **顏色主題**：8種預設顏色主題 + 彩虹動態效果
- **背景選項**：黑色、白色、綠色、透明背景
- **解析度選擇**：720p、1080p、4K、正方形格式

### 音訊設定
- **靈敏度調整**：控制視覺效果對音訊的反應程度
- **平滑度設定**：調整視覺效果的平滑程度
- **均衡器**：調整不同頻段的視覺強度

### 特效設定
- **特效縮放**：調整特效大小
- **位置偏移**：調整特效位置
- **視覺效果**：霓虹光、陰影、描邊等

## 📱 如何載入為 Chrome 擴充功能

1. **建置專案：**
   首先，您必須建置專案。此命令會創建一個包含您 API 金鑰的生產就緒 `dist` 資料夾。
   ```bash
   npm run build
   ```

2. **開啟 Chrome 擴充功能頁面：**
   在 Chrome 瀏覽器中導航到 `chrome://extensions`。

3. **啟用開發者模式：**
   在右上角，切換「開發者模式」開關。

4. **載入擴充功能：**
   點擊 **「載入未封裝項目」** 按鈕。

5. **選擇 `dist` 資料夾：**
   將開啟檔案選擇對話框。導航到您的專案資料夾並選擇在步驟 1 中創建的 **`dist`** 資料夾。**不要選擇整個專案資料夾。**

6. **完成！**
   擴充功能現在將出現在您的清單中。點擊 Chrome 工具列中的圖示即可使用。

## 🎵 支援的音訊格式

- **MP3** - 最常見的音訊格式
- **WAV** - 無損音訊格式
- **OGG** - 開源音訊格式
- **M4A** - Apple 音訊格式
- **FLAC** - 無損壓縮格式

## 🎬 錄製功能

### 錄製設定
- **固定品質**：8Mbps 比特率確保一致性
- **高幀率**：60fps 確保流暢效果
- **格式支援**：MP4（推薦）和 WebM
- **透明背景**：支援透明背景錄製

### 錄製流程
1. 上傳音訊檔案
2. 選擇視覺化風格
3. 調整設定
4. 點擊錄製按鈕
5. 自動從開始錄製到結束
6. 下載生成的影片

## 🛠️ 技術架構

- **React 18** - 現代 React 與 hooks
- **TypeScript** - 類型安全的開發
- **Vite** - 快速建置工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **Web Audio API** - 音訊處理
- **Canvas API** - 視覺效果渲染
- **MediaRecorder API** - 影片錄製

## 📁 專案結構

```
src/
├── components/          # React 組件
│   ├── AudioUploader.tsx      # 音訊上傳組件
│   ├── AudioVisualizer.tsx    # 主要視覺化組件
│   ├── Controls.tsx           # 控制面板
│   └── ...
├── hooks/              # 自訂 hooks
│   ├── useAudioAnalysis.ts    # 音訊分析
│   └── useMediaRecorder.ts    # 媒體錄製
├── constants/          # 常數定義
│   ├── adConfigs.ts           # 廣告配置
│   └── effectCategories.ts    # 效果分類
├── utils/              # 工具函數
│   └── adAnalytics.ts         # 廣告分析
├── App.tsx             # 主要應用程式組件
└── index.tsx           # 應用程式入口點
```

## 🚀 部署

### Railway 部署
專案已配置 Railway 部署，包含：
- 靜態檔案服務
- 環境變數支援
- 自動建置
- 生產優化

### 本地建置
```bash
npm run build
npm start
```

## 🔧 故障排除

### 常見問題
1. **音訊無法載入**：檢查音訊格式是否支援
2. **錄製失敗**：確保瀏覽器支援 MediaRecorder API
3. **AI 字幕生成失敗**：檢查 API 金鑰是否正確設定
4. **視覺效果卡頓**：降低靈敏度或關閉複雜效果

### 瀏覽器支援
- **Chrome** - 完全支援（推薦）
- **Firefox** - 完全支援
- **Safari** - 基本支援
- **Edge** - 完全支援

## 🤝 貢獻

1. Fork 此倉庫
2. 創建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

此專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案。

## 👨‍💻 作者

**音樂脈動-Sonic Pulse**

- YouTube 頻道：[🎵 音樂脈動-Sonic Pulse](https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse)

## 🙏 致謝

- 用 ❤️ 為音樂創作者社群打造
- 特別感謝所有音樂內容創作者
- 受到對更好音訊視覺化工具需求的啟發

---

**🎵 使用 AI 驅動的音訊視覺化，讓您的音樂更加生動！**

**最後更新**：2025年1月 - 增強視覺效果和字幕功能，修復文件大小一致性問題