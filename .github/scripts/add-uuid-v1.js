const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// JSONファイルを探す対象ディレクトリ
const targetDir = './public/v1/'; // 対象ディレクトリに変更してください

// ディレクトリ内のJSONファイルを再帰的に処理する関数
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.json')) {
      addUuidIfNeeded(filePath);
    }
  }
}

// JSONファイルにUUIDを追加する関数
function addUuidIfNeeded(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    let modified = false;
    
    // オブジェクトまたは配列内のオブジェクトにidがない場合、UUIDを追加
    if (Array.isArray(json)) {
      json.forEach(item => {
        if (typeof item === 'object' && item !== null && !item.id) {
          item.id = uuidv4();
          modified = true;
        }
      });
    } else if (typeof json === 'object' && json !== null && !json.id) {
      json.id = uuidv4();
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
      console.log(`Added UUID to ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// メイン処理を開始
processDirectory(targetDir);