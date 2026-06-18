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
    
    // Fix garish white gradients back to dark
    content = content.replace(/from-white/g, 'from-brand-dark');
    content = content.replace(/via-white\/60/g, 'via-brand-dark/60');
    content = content.replace(/via-white\/40/g, 'via-brand-dark/40');
    
    // Fix text-gray-100 on things that should have been white but were cream
    content = content.replace(/text-gray-100\/80/g, 'text-gray-300');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
