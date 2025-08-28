#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 獲取端口，優先使用環境變數，默認為 8080
const PORT = process.env.PORT || 8080;

console.log(`🔧 Starting server with serve package...`);
console.log(`📁 Current directory: ${__dirname}`);
console.log(`🌐 PORT from environment: ${process.env.PORT}`);
console.log(`🚀 Will use port: ${PORT}`);

// 檢查 dist 目錄是否存在
try {
  const { statSync } = await import('fs');
  const distPath = join(__dirname, 'dist');
  const distStats = statSync(distPath);
  console.log(`✅ Dist directory exists: ${distPath}`);
  console.log(`📊 Dist directory stats:`, distStats);
} catch (error) {
  console.error(`❌ Dist directory not found: ${join(__dirname, 'dist')}`);
  console.error(`Error:`, error);
  process.exit(1);
}

// 使用 serve 包啟動服務器
const serveProcess = spawn('npx', ['serve', '-s', 'dist', '-l', `tcp://0.0.0.0:${PORT}`], {
  stdio: 'inherit',
  cwd: __dirname
});

console.log(`🚀 Serve process started with PID: ${serveProcess.pid}`);
console.log(`🌐 Production URL: https://audio-visualizer-production.up.railway.app/`);
console.log(`📁 Serving files from: ${join(__dirname, 'dist')}`);
console.log(`⏰ Started at: ${new Date().toISOString()}`);

// 錯誤處理
serveProcess.on('error', (error) => {
  console.error(`❌ Serve process error:`, error);
  process.exit(1);
});

serveProcess.on('exit', (code, signal) => {
  console.log(`Serve process exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  serveProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  serveProcess.kill('SIGINT');
});
