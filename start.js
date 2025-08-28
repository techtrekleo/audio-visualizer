#!/usr/bin/env node

import { createServer } from 'http';
import { readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 獲取端口，優先使用環境變數，默認為 8080
const PORT = process.env.PORT || 8080;

console.log(`🔧 Starting server...`);
console.log(`📁 Current directory: ${__dirname}`);
console.log(`🌐 PORT from environment: ${process.env.PORT}`);
console.log(`🚀 Will use port: ${PORT}`);

// 檢查 dist 目錄是否存在
try {
  const distPath = join(__dirname, 'dist');
  const distStats = statSync(distPath);
  console.log(`✅ Dist directory exists: ${distPath}`);
  console.log(`📊 Dist directory stats:`, distStats);
} catch (error) {
  console.error(`❌ Dist directory not found: ${join(__dirname, 'dist')}`);
  console.error(`Error:`, error);
  process.exit(1);
}

// MIME 類型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

// 創建 HTTP 服務器
const server = createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = join(__dirname, 'dist', filePath);
  
  try {
    const stats = statSync(filePath);
    
    if (stats.isFile()) {
      const ext = extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      console.log(`✅ Served: ${req.url} (${contentType})`);
    } else {
      // 如果是目錄，嘗試 index.html
      const indexPath = join(filePath, 'index.html');
      try {
        const content = readFileSync(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
        console.log(`✅ Served directory: ${req.url} -> index.html`);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        console.log(`❌ 404: ${req.url} (directory not found)`);
      }
    }
  } catch (error) {
    // 文件不存在，返回 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    console.log(`❌ 404: ${req.url} (file not found)`);
    console.error(`Error:`, error);
  }
});

// 啟動服務器
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Production URL: https://audio-visualizer-production.up.railway.app/`);
  console.log(`📁 Serving files from: ${join(__dirname, 'dist')}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// 錯誤處理
server.on('error', (error) => {
  console.error(`❌ Server error:`, error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
  }
  process.exit(1);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
