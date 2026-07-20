import fs from 'fs';
import path from 'path';

function searchDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDirectory(fullPath);
      }
    } else {
      if (file.match(/\.(js|jsx|ts|tsx)$/)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('LessonCard')) {
          console.log(fullPath);
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (line.includes('LessonCard')) {
              console.log(`${i + 1}: ${line}`);
            }
          });
        }
      }
    }
  }
}

searchDirectory('D:/My Floder/root/React-Node.js/LEWM/LEVM-Frontend/src');
