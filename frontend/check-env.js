import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取构建后的文件并查找环境变量
const jsFiles = fs.readdirSync(path.join(__dirname, 'dist', 'assets'))
  .filter(file => file.endsWith('.js') && file.startsWith('index-'));

if (jsFiles.length > 0) {
  const jsFile = jsFiles[0];
  const jsPath = path.join(__dirname, 'dist', 'assets', jsFile);
  const content = fs.readFileSync(jsPath, 'utf8');
  
  // 查找环境变量
  const apiUrlMatch = content.match(/VITE_API_BASE_URL["\s]*:["\s]*["']([^"']+)["']/);
  
  if (apiUrlMatch) {
    console.log('找到的API URL:', apiUrlMatch[1]);
  } else {
    console.log('未找到API URL配置');
  }
} else {
  console.log('未找到JS文件');
}