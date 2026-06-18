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
    
    // Replace old cream/maroon/dark theme vars with generic tailwind or brand-red/black
    content = content.replace(/brand-dark/g, 'black');
    content = content.replace(/brand-cream/g, 'white');
    content = content.replace(/brand-maroon/g, 'brand-red');
    
    // For shadows that use the cream rgb
    content = content.replace(/218,205,196/g, '255,0,0');
    
    // For text colors that were black (because cream theme was light), make them white
    // Wait, earlier I replaced brand-dark with black. So text-brand-dark became text-black. 
    // In a dark theme, text should be white. 
    content = content.replace(/text-black/g, 'text-white');
    content = content.replace(/text-black\/80/g, 'text-gray-300');
    
    // Replace light gradients with dark
    content = content.replace(/from-white\/90/g, 'from-black/90');
    content = content.replace(/via-white\/40/g, 'via-black/40');
    content = content.replace(/bg-white\/90/g, 'bg-black/90');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
