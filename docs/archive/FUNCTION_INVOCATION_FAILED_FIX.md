# FUNCTION_INVOCATION_FAILED Error - Fix Summary

## Overview
This document summarizes the fixes applied to resolve the `FUNCTION_INVOCATION_FAILED` error on Vercel deployment. The error was caused by unhandled promise rejections and improper async error handling in Express route handlers.

## Files Changed

### 1. **vercel.json** (Configuration)
**Purpose:** Configure Vercel serverless deployment for the monorepo

**Key Changes:**
- Added `functions` section specifying `src/server.ts` as the serverless function entry point
- Updated routes configuration to properly route `/api/*` requests to the Express server
- Added HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS) to API routes
- Added `NODE_ENV: production` to environment variables
- Set memory to 1024 MB and timeout to 30 seconds for the function

**Before:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "routes": [
    { "src": "/api/(.*)", "dest": "/dist/server.js" },
    { "src": "/(.*)", "dest": "/frontend/.next/$1" }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

**After:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "functions": {
    "src/server.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/server.ts",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/.next/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

---

### 2. **src/server.ts** (Global Error Handling)
**Purpose:** Catch process-level errors and prevent function crashes

**Key Changes:**
- Enhanced `process.on('unhandledRejection')` handler with detailed logging
- Enhanced `process.on('uncaughtException')` handler with stack traces
- Added structured error logging with timestamps
- Added critical comments explaining why these handlers are essential for Vercel

**Updated Sections:**
```typescript
/**
 * CRITICAL: Global error handlers for Vercel serverless
 * These prevent FUNCTION_INVOCATION_FAILED errors by catching unhandled rejections
 * and uncaught exceptions at the process level.
 */

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  console.error('[CRITICAL] Unhandled Promise Rejection:', {
    reason,
    promise,
    timestamp: new Date().toISOString(),
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('[CRITICAL] Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
});
```

---

### 3. **src/utils/asyncHandler.ts** (Already Exists)
**Purpose:** Wrapper function for safe async route handlers

**How It Works:**
- Takes an async route handler function
- Returns a new handler that wraps the function with error catching
- Any error thrown in the async function is automatically caught and passed to Express error middleware via `next(error)`

**Usage Pattern:**
```typescript
import asyncHandler from '../../utils/asyncHandler';

// Before:
router.get('/endpoint', someAsyncController);

// After:
router.get('/endpoint', asyncHandler(someAsyncController));
```

---

### 4. **Route Files Updated** (13 files total)
All route files were updated to wrap async controllers with `asyncHandler`:

1. `src/modules/auth/auth.routes.ts`
2. `src/modules/students/student.routes.ts`
3. `src/modules/classes/class.routes.ts`
4. `src/modules/subjects/subject.routes.ts`
5. `src/modules/teachers/teacher.routes.ts`
6. `src/modules/teacherSubjects/teacherSubject.routes.ts`
7. `src/modules/exams/exam.routes.ts`
8. `src/modules/marks/marks.routes.ts`
9. `src/modules/results/result.routes.ts`
10. `src/modules/reports/report.routes.ts`
11. `src/modules/notifications/notification.routes.ts`
12. `src/modules/audit/audit.routes.ts`

**Example - Auth Routes:**
```typescript
// Import asyncHandler
import asyncHandler from '../../utils/asyncHandler';

// Wrap all async handlers
router.post('/login', authRateLimit, asyncHandler(login));
router.post('/refresh', authRateLimit, asyncHandler(refresh));
router.post('/logout', authRateLimit, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));
```

---

## Why These Changes Fix FUNCTION_INVOCATION_FAILED

### The Problem:
1. **Unhandled Promise Rejections:** When async functions throw errors that aren't caught, they become unhandled promise rejections
2. **Process Crashes:** In Vercel's serverless environment, unhandled rejections crash the entire function invocation
3. **No Error Recovery:** Without global handlers and proper async wrapping, errors bypass Express error middleware

### The Solution:
1. **Global Error Listeners:** Catch rejections and exceptions at the process level before they crash the function
2. **AsyncHandler Wrapper:** Ensures all async route handlers have their errors passed to Express error middleware via `next(error)`
3. **Proper Configuration:** vercel.json now correctly routes API requests to the Express serverless function

### Error Flow (After Fix):
```
Async Error Thrown
    ↓
asyncHandler catches it
    ↓
Calls next(error)
    ↓
Express Error Middleware (4-argument handler)
    ↓
Returns 500 JSON response to client
    ↓
Function completes successfully (no crash)
```

---

## Error Handler Middleware

The existing error handler in `src/middleware/errorHandler.ts` already has the correct 4-argument signature:

```typescript
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,  // ← 4 arguments required!
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(error(err.message, err.statusCode));
  }
  // ... other error handling
  return res.status(500).json(error('Internal server error', 500));
};
```

This is registered in `src/app.ts` as the final middleware:
```typescript
app.use(errorHandler);
```

---

## Deployment Instructions

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Fix FUNCTION_INVOCATION_FAILED: Add global error handlers, async wrapper, and update vercel.json"
git push origin v0/ayushjhaa1187-spec-d169e7da
```

### Step 2: Redeploy on Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments"
4. Click "Redeploy" on the latest deployment OR
5. Push to main branch if automatic deployments are enabled

### Step 3: Verify the Fix
1. **Check Deployment Status:**
   - Wait for deployment to complete (should be green/success)
   - Check the build logs for any errors

2. **Test API Endpoints:**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```
   Expected response:
   ```json
   {
     "status": "OK",
     "message": "API and Database are healthy",
     "timestamp": "2026-03-12T..."
   }
   ```

3. **Monitor Function Logs:**
   - Go to Vercel dashboard
   - Select your project
   - Go to "Deployments" → Select latest → "Functions"
   - Check for any `[CRITICAL]` error messages
   - Any errors should now return HTTP 500 with error details instead of FUNCTION_INVOCATION_FAILED

4. **Test Error Handling:**
   - Make a request that should fail (e.g., unauthorized request)
   - Verify you get a proper error response, not a function invocation error

---

## Differences Between Local and Production

| Aspect | Local | Production (Vercel) |
|--------|-------|-------------------|
| Server Type | Persistent Node.js process | Stateless serverless function |
| Error Handling | Process continues for some unhandled rejections | Function invocation fails immediately |
| Global Handlers | Optional | CRITICAL for stability |
| Logging | Goes to console | Captured in Vercel logs |
| Memory | Unlimited (within OS) | Limited (1024 MB configured) |
| Timeout | Long-running | 30 seconds (configured) |

---

## Common Issues & Troubleshooting

### Issue: Still Getting FUNCTION_INVOCATION_FAILED
**Solution:**
1. Check if all route files have asyncHandler imports
2. Verify vercel.json is deployed (check Vercel dashboard settings)
3. Clear Vercel cache: Redeploy with `--force` or delete and redeploy
4. Check function logs for `[CRITICAL]` errors

### Issue: 404 on /api/* routes
**Solution:**
1. Verify vercel.json routes configuration
2. Check that src/server.ts is being built to dist/
3. Ensure package.json build script compiles TypeScript to JavaScript

### Issue: Database connection errors
**Solution:**
1. Verify DATABASE_URL environment variable is set in Vercel
2. Check that the database is accessible from Vercel's infrastructure
3. Add IP allowlist if using managed databases

---

## Related Documentation
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Error Tracking](https://vercel.com/docs/observability/error-tracking)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Node.js Unhandled Rejections](https://nodejs.org/en/docs/guides/unhandled-rejections/)
