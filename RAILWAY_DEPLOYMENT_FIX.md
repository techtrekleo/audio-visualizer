# 🚂 Railway 部署修復指南

## 🚨 **當前問題**
你的音樂視覺化網站 [https://audio-visualizer-production.up.railway.app/](https://audio-visualizer-production.up.railway.app/) 無法訪問。

## 🔧 **已修復的配置**

### 1. **Railway 配置文件** (`railway.json`)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### 2. **Node.js 版本** (`.nvmrc`)
```
18
```

## 📋 **Railway 控制台設置步驟**

### 第一步：登入 Railway
1. 前往 [Railway Dashboard](https://railway.app/dashboard)
2. 選擇你的 `audio-visualizer-production` 項目

### 第二步：檢查部署狀態
1. 點擊「Deployments」標籤
2. 查看最新的部署是否成功
3. 如果失敗，點擊查看錯誤日誌

### 第三步：設置環境變數
在 Railway 控制台中，前往「Variables」標籤，確保以下變數已設置：

```
NODE_ENV=production
PORT=3000
```

### 第四步：重新部署
1. 點擊「Deploy」按鈕
2. 選擇「Deploy from GitHub branch」
3. 選擇 `main` 分支
4. 等待部署完成

## 🚀 **手動部署命令**

如果自動部署失敗，可以在 Railway 控制台的「Settings」→「General」中：

1. **構建命令**：`npm run build`
2. **啟動命令**：`npm start`
3. **健康檢查路徑**：`/`

## 🔍 **常見問題排查**

### 問題 1：構建失敗
- 檢查 Node.js 版本是否為 18+
- 確認所有依賴已安裝
- 查看構建日誌中的錯誤信息

### 問題 2：啟動失敗
- 檢查 PORT 環境變數
- 確認 dist 目錄存在
- 查看啟動日誌

### 問題 3：健康檢查失敗
- 確認 healthcheckPath 設置為 `/`
- 檢查網站是否正常響應
- 查看健康檢查日誌

## 📊 **部署狀態檢查**

### 成功指標
- ✅ 構建狀態：Success
- ✅ 部署狀態：Running
- ✅ 健康檢查：Passed
- ✅ 網站可訪問

### 失敗指標
- ❌ 構建狀態：Failed
- ❌ 部署狀態：Failed
- ❌ 健康檢查：Failed
- ❌ 網站無法訪問

## 🆘 **緊急修復**

如果網站仍然無法訪問：

1. **強制重新部署**：
   - 在 Railway 控制台中點擊「Redeploy」
   - 選擇「Force Redeploy」

2. **檢查資源使用**：
   - 確認沒有超出 Railway 的免費額度
   - 檢查 CPU 和內存使用情況

3. **聯繫支持**：
   - 如果問題持續，聯繫 Railway 支持

## 📞 **技術支持**

- **Railway 文檔**：https://docs.railway.app/
- **Railway 論壇**：https://community.railway.app/
- **GitHub Issues**：在你的項目倉庫中創建 issue

---

**🎯 目標：讓你的音樂視覺化網站重新上線！**

