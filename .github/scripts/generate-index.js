const fs = require('fs');
const path = require('path');

// 環境変数からtargetDirを取得、なければデフォルト値を使用
const targetDir = process.env.TARGET_DIR || './public/v1/';
const outputFilePath = './public/v1/index.json';

// 処理したファイルの情報を保存する配列
const fileRegistry = [];

// ディレクトリ内のJSONファイルを再帰的に処理する関数
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.json')) {
      extractFileInfo(filePath);
    }
  }
}

// JSONファイルから情報を抽出する関数
function extractFileInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    let fileInfo = {
      path: filePath,
      lastUpdated: null,
      id: null
    };
    
    // 配列の場合
    if (Array.isArray(json)) {
      if (json.length > 0 && typeof json[0] === 'object' && json[0] !== null) {
        fileInfo.lastUpdated = json[0].lastUpdated;
        fileInfo.id = json[0].id;
      }
    } 
    // オブジェクトの場合
    else if (typeof json === 'object' && json !== null) {
      fileInfo.lastUpdated = json.lastUpdated;
      fileInfo.id = json.id;
    }
    
    fileRegistry.push(fileInfo);
    console.log(`Extracted info from ${filePath}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// ファイルレジストリをindex.jsonとして保存する関数
function saveIndex() {
  try {
    const indexData = {
      generatedAt: new Date().toISOString(),
      files: fileRegistry
    };
    
    fs.writeFileSync(outputFilePath, JSON.stringify(indexData, null, 2));
    console.log(`File index saved to ${outputFilePath}`);
  } catch (error) {
    console.error(`Error saving index: ${error.message}`);
  }
}

// メイン処理を開始
console.log(`Generating index for JSON files in: ${targetDir}`);
processDirectory(targetDir);
// ファイルレジストリを保存
saveIndex();