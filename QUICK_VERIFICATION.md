# 快速驗證指南

## 🚀 立即測試改進效果

### 第一步：啟動應用
```bash
cd audio-visualizer-repo
npm run dev
```

### 第二步：打開瀏覽器
1. 打開 http://localhost:5173
2. 按 F12 打開開發者工具
3. 切換到 Console 標籤

### 第三步：快速測試

#### 測試1：載入短音頻（<30秒）
1. 上傳一個短音頻文件（15-20秒）
2. 檢查控制台輸出
3. **預期看到**：
   ```
   Audio initialized with FFT size: 1024, Sample rate: 48000Hz, Duration: XXs
   ```

#### 測試2：載入中等音頻（30-300秒）
1. 上傳一個中等音頻文件（2-3分鐘）
2. 檢查控制台輸出
3. **預期看到**：
   ```
   Audio initialized with FFT size: 2048, Sample rate: 48000Hz, Duration: XXs
   ```

#### 測試3：載入長音頻（>300秒）
1. 上傳一個長音頻文件（5-10分鐘）
2. 檢查控制台輸出
3. **預期看到**：
   ```
   Audio initialized with FFT size: 4096, Sample rate: 48000Hz, Duration: XXs
   ```

### 第四步：錄製測試

#### 短音頻錄製
1. 載入短音頻後點擊錄製
2. **預期看到**：
   ```
   Recording started with FPS: 60, Bitrate: 12Mbps, Timeslice: 500ms
   ```

#### 中等音頻錄製
1. 載入中等音頻後點擊錄製
2. **預期看到**：
   ```
   Recording started with FPS: 60, Bitrate: 8Mbps, Timeslice: 1000ms
   ```

#### 長音頻錄製
1. 載入長音頻後點擊錄製
2. **預期看到**：
   ```
   Recording started with FPS: 30, Bitrate: 6Mbps, Timeslice: 2000ms
   ```

## ✅ 成功指標

### 如果看到以下輸出，說明改進成功：
- [ ] FFT大小根據音頻長度動態調整
- [ ] 錄製設定根據音頻長度動態調整
- [ ] 控制台顯示詳細的調試信息
- [ ] 錄製時長與音頻長度一致

### 如果沒有看到預期輸出，可能的原因：
1. **代碼未更新**：檢查文件是否保存
2. **瀏覽器緩存**：按 Ctrl+F5 強制刷新
3. **開發服務器未重啟**：重新啟動 npm run dev

## 🔧 調試命令

### 在瀏覽器控制台執行以下命令檢查狀態：

```javascript
// 檢查音頻信息
console.log('Audio Info:', getAudioInfo());

// 檢查錄製信息
console.log('Recording Info:', getRecordingInfo());

// 檢查當前音頻長度
console.log('Audio Duration:', audioRef.current?.duration);
```

## 📊 預期結果對比

| 音頻長度 | FFT大小 | 幀率 | 比特率 | 數據間隔 | 狀態 |
|---------|---------|------|--------|----------|------|
| <30秒   | 1024    | 60fps| 12Mbps | 500ms   | ✅   |
| 30-300秒| 2048    | 60fps| 8Mbps  | 1000ms  | ✅   |
| >300秒  | 4096    | 30fps| 6Mbps  | 2000ms  | ✅   |

## 🎯 下一步

如果快速測試通過，請進行完整測試：
1. 查看 `TESTING_GUIDE.md` 進行詳細測試
2. 測試不同瀏覽器的兼容性
3. 測試不同設備的性能表現
4. 收集用戶反饋

## 🚨 緊急修復

如果發現問題，請檢查：
1. 控制台是否有錯誤信息
2. 音頻文件格式是否支持
3. 瀏覽器是否支持所需功能
4. 代碼是否有語法錯誤
