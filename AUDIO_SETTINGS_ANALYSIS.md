# 音頻設定問題分析與解決方案

## 🎯 問題描述
用戶反映"同一首歌時間長短不一樣"，這主要是由於音頻處理設定不一致導致的技術問題。

## 🔍 根本原因分析

### 1. **FFT大小設定問題**

#### 原始設定
```typescript
analyser.fftSize = 2048; // 固定設定
```

#### 問題分析
- **固定FFT大小**：所有音頻文件都使用相同的FFT大小
- **時間分辨率不足**：2048的FFT大小對短音頻來說時間分辨率過低
- **頻率分辨率過剩**：對長音頻來說頻率分辨率過高，浪費資源

#### 影響
- 短音頻（<30秒）：時間分辨率不足，導致錄製時長不準確
- 長音頻（>300秒）：頻率分辨率過高，影響性能
- 不同設備：處理能力差異導致結果不一致

### 2. **音頻上下文樣本率問題**

#### 瀏覽器差異
- Chrome: 通常使用48kHz
- Firefox: 通常使用44.1kHz
- Safari: 可能使用不同的樣本率

#### 問題影響
- 音頻處理精度不一致
- 時間計算可能出現微小誤差
- 不同瀏覽器結果不同

### 3. **MediaRecorder設定問題**

#### 原始設定
```typescript
const canvasStream = canvasElement.captureStream(30); // 固定30fps
mediaRecorderRef.current.start(1000); // 固定1秒間隔
```

#### 問題分析
- **固定幀率**：所有錄製都使用30fps，不考慮音頻特性
- **固定間隔**：數據收集間隔不根據音頻長度調整
- **比特率固定**：所有錄製使用相同比特率

## ✅ 解決方案

### 1. **動態FFT大小設定**

#### 改進後設定
```typescript
// 根據音頻長度動態調整FFT大小
let optimalFftSize = 2048; // 默認值
if (audioDuration > 0) {
    if (audioDuration < 30) {
        // 短音頻：使用較小的FFT大小，提高時間分辨率
        optimalFftSize = 1024;
    } else if (audioDuration > 300) {
        // 長音頻：使用較大的FFT大小，提高頻率分辨率
        optimalFftSize = 4096;
    }
    // 30-300秒的音頻使用默認2048
}
analyser.fftSize = optimalFftSize;
analyser.smoothingTimeConstant = 0.8; // 添加平滑設定
```

#### 效果
- **短音頻**：提高時間分辨率，確保錄製時長準確
- **長音頻**：提高頻率分辨率，保持音質
- **性能優化**：根據音頻特性選擇最優設定

### 2. **動態MediaRecorder設定**

#### 改進後設定
```typescript
// 根據音頻信息動態調整幀率
let optimalFps = 60;
if (audioInfo && audioInfo.duration) {
    if (audioInfo.duration < 30) {
        optimalFps = 60; // 短音頻：高幀率確保流暢
    } else if (audioInfo.duration > 300) {
        optimalFps = 30; // 長音頻：低幀率節省資源
    }
}

// 動態調整比特率
let videoBitsPerSecond = 8000000; // 8 Mbps
if (audioInfo && audioInfo.duration) {
    if (audioInfo.duration < 30) {
        videoBitsPerSecond = 12000000; // 12 Mbps for short videos
    } else if (audioInfo.duration > 300) {
        videoBitsPerSecond = 6000000; // 6 Mbps for long videos
    }
}

// 動態調整數據收集頻率
let timeslice = 1000; // 默認每秒收集一次
if (audioInfo && audioInfo.duration) {
    if (audioInfo.duration < 30) {
        timeslice = 500; // 短音頻：每0.5秒收集一次
    } else if (audioInfo.duration > 300) {
        timeslice = 2000; // 長音頻：每2秒收集一次
    }
}
```

#### 效果
- **短音頻**：高幀率、高比特率、頻繁數據收集
- **長音頻**：低幀率、低比特率、稀疏數據收集
- **資源優化**：根據音頻長度動態調整

### 3. **音頻信息監控**

#### 新增功能
```typescript
const getAudioInfo = useCallback(() => {
    if (!audioContextRef.current || !analyserRef.current) return null;
    
    return {
        sampleRate: audioContextRef.current.sampleRate,
        fftSize: analyserRef.current.fftSize,
        frequencyBinCount: analyserRef.current.frequencyBinCount,
        duration: audioDurationRef.current,
        contextState: audioContextRef.current.state
    };
}, []);
```

#### 效果
- **調試信息**：提供詳細的音頻處理信息
- **問題診斷**：幫助識別設定問題
- **性能監控**：實時監控音頻處理狀態

## 📊 設定對比表

| 音頻長度 | FFT大小 | 幀率 | 比特率 | 數據間隔 | 時間分辨率 | 頻率分辨率 |
|---------|---------|------|--------|----------|-----------|-----------|
| <30秒   | 1024    | 60fps| 12Mbps | 500ms   | 高        | 中        |
| 30-300秒| 2048    | 60fps| 8Mbps  | 1000ms  | 中        | 中        |
| >300秒  | 4096    | 30fps| 6Mbps  | 2000ms  | 低        | 高        |

## 🔧 實施步驟

### 1. **音頻分析改進**
- [x] 動態FFT大小設定
- [x] 音頻信息監控
- [x] 平滑設定添加

### 2. **錄製設定改進**
- [x] 動態幀率調整
- [x] 動態比特率設定
- [x] 動態數據收集頻率

### 3. **調試功能**
- [x] 音頻信息輸出
- [x] 錄製信息監控
- [x] 控制台日誌

## 🎯 預期效果

### 時間一致性
- **短音頻**：時間分辨率提高，錄製時長更準確
- **長音頻**：資源優化，避免性能問題
- **跨設備**：設定自適應，結果更一致

### 性能優化
- **資源使用**：根據音頻特性動態調整
- **處理效率**：避免不必要的計算
- **穩定性**：減少因設定不當導致的問題

### 用戶體驗
- **一致性**：同一首歌在不同情況下結果一致
- **可靠性**：減少錄製失敗和時長錯誤
- **透明度**：提供詳細的處理信息

## 🚀 未來改進

### 短期改進
1. **瀏覽器檢測**：根據瀏覽器特性調整設定
2. **設備性能檢測**：根據設備性能動態調整
3. **音頻格式檢測**：根據音頻格式優化處理

### 長期改進
1. **機器學習優化**：使用ML模型預測最佳設定
2. **雲端處理**：支持雲端音頻處理
3. **實時優化**：實時調整處理參數

## 📝 測試建議

### 功能測試
1. 測試不同長度的音頻文件
2. 測試不同格式的音頻文件
3. 測試不同瀏覽器的兼容性
4. 測試不同設備的性能表現

### 性能測試
1. 監控CPU和內存使用
2. 測試錄製過程的穩定性
3. 驗證音視頻同步準確性
4. 檢查生成文件的質量

### 用戶測試
1. 收集用戶反饋
2. 監控錯誤報告
3. 分析使用模式
4. 優化用戶體驗
