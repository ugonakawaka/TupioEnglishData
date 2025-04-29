const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 環境変数からtargetDirを取得、なければデフォルト値を使用
const targetDir = process.env.TARGET_DIR || './public/v1/';
console.log(`Processing JSON files in: ${targetDir}`);

// ディレクトリ内のJSONファイルを再帰的に処理する関数
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.json')) {
      updateJsonFile(filePath);
    }
  }
}

// JSONファイルを更新する関数
function updateJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    let modified = false;
    const now = new Date().toISOString(); // ISO形式の現在時刻
    
    // 配列の場合
    if (Array.isArray(json)) {
      json.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          // idフィールドがない場合、追加
          if (!item.id) {
            item.id = uuidv4();
            modified = true;
          }
          
          // lastUpdatedフィールドを更新
          item.lastUpdated = now;
          modified = true;
        }
      });
    } 
    // オブジェクトの場合
    else if (typeof json === 'object' && json !== null) {
      // idフィールドがない場合、追加
      if (!json.id) {
        json.id = uuidv4();
        modified = true;
      }
      
      // lastUpdatedフィールドを更新
      json.lastUpdated = now;
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
      console.log(`Updated ${filePath} with ID and lastUpdated timestamp`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// メイン処理を開始
processDirectory(targetDir);