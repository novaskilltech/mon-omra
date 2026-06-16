const fs = require('fs');
const path = require('path');

const source = 'C:\\Users\\P C\\.gemini\\antigravity\\brain\\ec5ef82b-cb13-468f-ae80-f1add3597e92\\og_image_1781541046149.png';
const destination = 'c:\\Users\\P C\\Documents\\OMRA APP AVEC QWEN\\public\\og-image.png';

try {
  fs.copyFileSync(source, destination);
  console.log('Successfully copied og-image to public folder!');
} catch (err) {
  console.error('Failed to copy file:', err);
}
