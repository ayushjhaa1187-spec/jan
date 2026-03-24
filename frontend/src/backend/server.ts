import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 5000;

// Only start the server if we are running in a local environment
// Vercel handles the server execution for us
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
