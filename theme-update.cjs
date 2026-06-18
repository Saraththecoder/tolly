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
    
    // Replace all #0A0A0A with black
    content = content.replace(/\[#0A0A0A\]/g, 'black');
    content = content.replace(/bg-[#1A1A1A]/g, 'bg-black');
    
    // Convert some white borders to red
    content = content.replace(/border-white\/10/g, 'border-brand-red/20');
    content = content.replace(/border-white\/5/g, 'border-brand-red/10');
    
    // Remove gray tones
    content = content.replace(/text-gray-400/g, 'text-gray-300'); // Make text slightly brighter against pure black
    content = content.replace(/text-gray-500/g, 'text-red-900/80'); // Dim text gets a red tint
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
