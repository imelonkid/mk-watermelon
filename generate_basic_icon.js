// 这个脚本需要安装canvas库: npm install canvas
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 生成图标函数
function generateIcon(size, filename) {
  // 创建画布
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 绘制蓝色圆形背景
  ctx.fillStyle = '#1a73e8';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();
  
  // 绘制白色字母"D"
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('D', size/2, size/2);
  
  // 保存为PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'images', filename), buffer);
  
  console.log(`${filename} 已创建!`);
}

// 创建目录（如果不存在）
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 生成不同尺寸的图标
generateIcon(16, 'icon16.png');
generateIcon(48, 'icon48.png');
generateIcon(128, 'icon128.png');

console.log('所有图标已生成完成!'); 