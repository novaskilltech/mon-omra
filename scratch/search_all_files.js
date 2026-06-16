const fs = require('fs');
const path = require('path');

function searchFile(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    // Ignore node_modules, .git, and .next
    if (file === 'node_modules' || file === '.git' || file === '.next') {
      return;
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchFile(filePath, fileList);
    } else {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.toLowerCase().includes('salah.lamkhannet@gmail.com')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const matches = searchFile(path.resolve(__dirname, '..'));
console.log('Matching files:', matches);
