try {
  const app = require('../dist/app').default;
  module.exports = app;
} catch (error) {
  console.error('Initialization error:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Initialization failed',
      details: error.message,
      stack: error.stack
    });
  };
}
