# Complete Diffs - FUNCTION_INVOCATION_FAILED Fix

## File 1: vercel.json

### BEFORE
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/dist/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/.next/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

### AFTER
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

### Key Changes
| Change | Why |
|--------|-----|
| Added `functions` section | Explicitly defines serverless function runtime and resources |
| Changed `dest` from `/dist/server.js` to `src/server.ts` | Vercel handles compilation automatically for source files |
| Added `methods` array | Ensures all HTTP methods are properly routed to the function |
| Added `NODE_ENV: production` | Required for production environment setup |
| Added `memory: 1024` | Allocates sufficient RAM for database operations |
| Added `maxDuration: 30` | Sets 30-second timeout for API requests |

---

## File 2: src/server.ts

### BEFORE (Error Handlers)
```typescript
// Handle unhandled promise rejections - CRITICAL for Vercel serverless
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, this could cause FUNCTION_INVOCATION_FAILED
});

// Handle uncaught exceptions - CRITICAL for Vercel serverless
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, this could cause FUNCTION_INVOCATION_FAILED
});
```

### AFTER (Error Handlers)
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
  
  // In serverless environments, log and continue
  // The error middleware in Express will handle the actual HTTP response
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('[CRITICAL] Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  // In serverless environments, we should attempt to gracefully handle this
  // However, if an exception reaches this point, the function is in an unstable state
  // Log it and let the request be handled by the error middleware if possible
});
```

### Key Changes
| Change | Why |
|--------|-----|
| Added TypeScript types | Better type safety and clarity |
| Added structured error objects | Easier to parse logs and debug issues |
| Added `[CRITICAL]` prefix | Makes critical errors visible in log searches |
| Added timestamps | Helps correlate errors with request timing |
| Added stack traces | Shows where exceptions originated |
| Added detailed comments | Explains behavior for serverless environment |

---

## File 3: src/modules/auth/auth.routes.ts

### BEFORE
```typescript
import { NextFunction, Request, Response, Router } from 'express';
import { login, logout, me, refresh } from './auth.controller';
import { requireAuth } from './auth.middleware';

const router = Router();

const authRateLimitMap = new Map<string, { count: number; windowStart: number }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_REQUESTS = 20;

const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const current = authRateLimitMap.get(key);

  if (!current || now - current.windowStart > AUTH_WINDOW_MS) {
    authRateLimitMap.set(key, { count: 1, windowStart: now });
    return next();
  }

  if (current.count >= AUTH_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many authentication requests' });
  }

  current.count += 1;
  authRateLimitMap.set(key, current);
  return next();
};

router.post('/login', authRateLimit, login);
router.post('/refresh', authRateLimit, refresh);
router.post('/logout', authRateLimit, logout);
router.get('/me', requireAuth, me);

export default router;
```

### AFTER
```typescript
import { NextFunction, Request, Response, Router } from 'express';
import { login, logout, me, refresh } from './auth.controller';
import { requireAuth } from './auth.middleware';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

const authRateLimitMap = new Map<string, { count: number; windowStart: number }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_REQUESTS = 20;

const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const current = authRateLimitMap.get(key);

  if (!current || now - current.windowStart > AUTH_WINDOW_MS) {
    authRateLimitMap.set(key, { count: 1, windowStart: now });
    return next();
  }

  if (current.count >= AUTH_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many authentication requests' });
  }

  current.count += 1;
  authRateLimitMap.set(key, current);
  return next();
};

router.post('/login', authRateLimit, asyncHandler(login));
router.post('/refresh', authRateLimit, asyncHandler(refresh));
router.post('/logout', authRateLimit, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
```

### Key Changes
| Line | Before | After | Why |
|------|--------|-------|-----|
| 4 | (missing) | `import asyncHandler...` | Import the error-catching wrapper |
| 30 | `router.post('/login', authRateLimit, login);` | `router.post('/login', authRateLimit, asyncHandler(login));` | Wrap handler to catch async errors |
| 31 | `router.post('/refresh', authRateLimit, refresh);` | `router.post('/refresh', authRateLimit, asyncHandler(refresh));` | Wrap handler to catch async errors |
| 32 | `router.post('/logout', authRateLimit, logout);` | `router.post('/logout', authRateLimit, asyncHandler(logout));` | Wrap handler to catch async errors |
| 33 | `router.get('/me', requireAuth, me);` | `router.get('/me', requireAuth, asyncHandler(me));` | Wrap handler to catch async errors |

---

## File 4: src/modules/students/student.routes.ts

### BEFORE
```typescript
import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudentMarks,
  getStudentResults,
  getStudents,
  transferStudentClass,
  updateStudent,
} from './student.controller';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_students'), createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', requirePermission('manage_students'), updateStudent);
router.delete('/:id', requirePermission('manage_students'), deleteStudent);
router.put('/:id/class', requirePermission('manage_students'), transferStudentClass);
router.get('/:id/results', getStudentResults);
router.get('/:id/marks', getStudentMarks);

export default router;
```

### AFTER
```typescript
import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudentMarks,
  getStudentResults,
  getStudents,
  transferStudentClass,
  updateStudent,
} from './student.controller';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_students'), asyncHandler(createStudent));
router.get('/', asyncHandler(getStudents));
router.get('/:id', asyncHandler(getStudentById));
router.put('/:id', requirePermission('manage_students'), asyncHandler(updateStudent));
router.delete('/:id', requirePermission('manage_students'), asyncHandler(deleteStudent));
router.put('/:id/class', requirePermission('manage_students'), asyncHandler(transferStudentClass));
router.get('/:id/results', asyncHandler(getStudentResults));
router.get('/:id/marks', asyncHandler(getStudentMarks));

export default router;
```

### Changes Pattern
- Added `import asyncHandler from '../../utils/asyncHandler';` at line 13
- Wrapped all route handlers with `asyncHandler()`
- This pattern is identical for all 13 route files

---

## asyncHandler Utility (Already Existed)

```typescript
// src/utils/asyncHandler.ts
import { NextFunction, Request, Response } from 'express';

/**
 * Wraps async route handlers to catch errors automatically
 * Prevents unhandled promise rejections that cause FUNCTION_INVOCATION_FAILED on Vercel
 * 
 * Usage:
 * router.get('/endpoint', asyncHandler(async (req, res) => {
 *   // Your async code here
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
```

### How It Works:
1. **Input:** Takes an async function that matches Express route handler signature
2. **Wrapping:** Returns a new synchronous function that Express can call
3. **Error Catching:** `Promise.resolve().catch(next)` catches any error and passes it to Express error middleware
4. **Result:** All errors result in HTTP 500 response instead of function crash

---

## Error Handler Middleware (No Changes Needed)

```typescript
// src/middleware/errorHandler.ts
// This file was NOT modified - it already has the correct 4-argument signature

export const errorHandler = (
  err: unknown,                    // ← Error object
  _req: Request,                   // ← Request (not used, prefixed with _)
  res: Response,                   // ← Response object
  _next: NextFunction,             // ← Next function (4th parameter marks this as error handler!)
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(error(err.message, err.statusCode));
  }

  if (err instanceof ZodError) {
    return res.status(400).json(error(err.issues[0]?.message || 'Validation failed', 400));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json(error('Resource already exists', 409));
    }
    return res.status(400).json(error('Database operation failed', 400));
  }

  return res.status(500).json(error('Internal server error', 500));
};
```

**Key Point:** Express only recognizes error handlers with **exactly 4 parameters**. The `_next` parameter is required even if unused.

---

## Error Flow Diagram

### Before Fix (Broken)
```
Async Error Thrown in Route Handler
    ↓
No asyncHandler wrapper
    ↓
Error escapes as unhandled promise rejection
    ↓
process.on('unhandledRejection') catches it (logs only, doesn't stop crash)
    ↓
Function invocation terminates
    ↓
Vercel returns: FUNCTION_INVOCATION_FAILED (HTTP 500, generic error)
```

### After Fix (Working)
```
Async Error Thrown in Route Handler
    ↓
asyncHandler catches error with .catch(next)
    ↓
Error passed to Express error middleware via next(error)
    ↓
errorHandler middleware (4-argument function) intercepts it
    ↓
Returns proper JSON error response
    ↓
Function completes successfully
    ↓
Client receives: HTTP 500 with application-specific error details
```

---

## Summary of Changes

| Component | Changes | Impact |
|-----------|---------|--------|
| **vercel.json** | Configuration for serverless function | Enables proper API routing in production |
| **src/server.ts** | Enhanced error handlers with logging | Catches process-level errors before crash |
| **13 Route Files** | Added asyncHandler wrapper | Ensures all async errors reach error middleware |
| **src/middleware/errorHandler.ts** | No changes needed | Already had correct signature |
| **src/utils/asyncHandler.ts** | No changes needed | Already properly implemented |

All changes work together to create a multi-layer error safety net:
1. **Route Layer:** asyncHandler catches errors and passes to next()
2. **Middleware Layer:** errorHandler processes and returns HTTP response
3. **Process Layer:** Unhandled errors logged but don't crash function
4. **Configuration Layer:** vercel.json properly routes requests

---

## Testing the Fixes

### Test 1: Verify Health Endpoint
```bash
curl -X GET https://your-domain.vercel.app/api/health
# Expected: 200 OK with status=OK
```

### Test 2: Verify Error Handling
```bash
curl -X POST https://your-domain.vercel.app/api/students \
  -H "Authorization: Bearer invalid-token"
# Expected: 401 Unauthorized (not FUNCTION_INVOCATION_FAILED)
```

### Test 3: Check Logs
```
Vercel Dashboard → Deployments → [Latest] → Functions → [function-name] → Logs

Look for:
- No FUNCTION_INVOCATION_FAILED errors
- Proper [CRITICAL] error messages if errors occur
- HTTP status codes returned to clients
```

---

## Deployment Checklist

Before pushing to production:
- [ ] All 13 route files have `asyncHandler` imports
- [ ] All async route handlers are wrapped with `asyncHandler()`
- [ ] vercel.json has been updated with `functions` section
- [ ] src/server.ts has enhanced error handlers
- [ ] No syntax errors: `npm run build` succeeds locally
- [ ] Environment variables set in Vercel dashboard

After deployment:
- [ ] Build completes without errors in Vercel
- [ ] /api/health endpoint returns 200 OK
- [ ] No FUNCTION_INVOCATION_FAILED errors in logs
- [ ] Error responses return proper JSON (not generic function errors)
- [ ] Database operations complete successfully
