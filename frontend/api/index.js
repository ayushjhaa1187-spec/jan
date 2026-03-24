const path = require('path');
const fs = require('fs');

try {
  const appPath = path.resolve(__dirname, '../dist/src/backend/app');
  // NOTE: When compiled with tsc, the output path matches the source structure.
  // frontend/src/backend/app.ts -> frontend/dist/src/backend/app.js
  
  if (!fs.existsSync(appPath + '.js')) {
      console.error('API_CRITICAL: Unified App logic not found at', appPath);
  }

  const app = require(appPath).default;
  module.exports = app;
} catch (err) {
  console.error('FRONTEND_API_BOOT_ERROR:', err);
  module.exports = (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Backend Integration Error',
      details: err.message
    });
  };
}
