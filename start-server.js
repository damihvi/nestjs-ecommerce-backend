const { exec } = require('child_process');
const path = require('path');

console.log('Working directory:', process.cwd());
console.log('Attempting to start server...');

const serverPath = path.join(__dirname, 'dist', 'main.js');
console.log('Server path:', serverPath);

require('./dist/main.js');
