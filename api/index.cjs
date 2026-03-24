const path = require('path');
const fs = require('fs');

try {
  const rootDir = path.resolve(__dirname, '..');
  console.log('API ROOT DIR:', rootDir);
  console.log('FILES AT ROOT:', fs.readdirSync(rootDir).join(', '));
  
  if (fs.existsSync(path.join(rootDir, 'dist'))) {
      console.log('FILES AT DIST:', fs.readdirSync(path.join(rootDir, 'dist')).join(', '));
  } else {
      console.error('CRITICAL: dist folder NOT found at', rootDir);
  }

  const appPath = path.resolve(__dirname, '../dist/app');
  const app = require(appPath).default;
  module.exports = app;
} catch (err) {
  console.error('SERVERLESS_INIT_ERROR:', err);
  module.exports = (req, res) => {
    res.status(500).json({
      success: false,
      error: 'API Initialization Error',
      details: err.message,
      rootDir: path.resolve(__dirname, '..'),
      filesAtRoot: fs.existsSync(path.resolve(__dirname, '..')) ? fs.readdirSync(path.resolve(__dirname, '..')) : 'NOT_FOUND'
    });
  };
}
