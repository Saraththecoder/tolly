const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('d:/tolly/src', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace pure black with nuanced brand-dark
    content = content.replace(/bg-black/g, 'bg-brand-dark');
    content = content.replace(/from-black/g, 'from-brand-dark');
    content = content.replace(/via-black/g, 'via-brand-dark');
    
    // Soften pure whites slightly for readability and premium feel
    content = content.replace(/text-white/g, 'text-gray-100');
    content = content.replace(/border-white/g, 'border-gray-100/20');
    
    // Soften grays for metadata
    content = content.replace(/text-gray-300/g, 'text-gray-400');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
