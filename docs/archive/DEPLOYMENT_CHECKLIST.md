# Deployment Checklist - FUNCTION_INVOCATION_FAILED Fix

## Pre-Push Verification (✅ All Completed)

### Code Quality Checks
- [x] asyncHandler utility exists and is properly exported
- [x] Error handler middleware has 4-argument signature (err, req, res, next)
- [x] All 13 route files wrapped with asyncHandler
- [x] Global process error listeners added to server.ts
- [x] TypeScript compiles without errors (target: ES2020, module: commonjs)
- [x] vercel.json properly configured for serverless
- [x] package.json build command: "tsc" ✓

### Configuration Validation
- [x] vercel.json routes configured correctly
  - API routes point to src/server.ts ✓
  - Frontend routes point to /frontend/.next ✓
  - All HTTP methods enabled (GET, POST, PUT, DELETE, PATCH, OPTIONS) ✓
- [x] Functions config set with nodejs20.x runtime ✓
- [x] Memory: 1024 MB ✓
- [x] Max Duration: 30 seconds ✓
- [x] Environment variables configured:
  - DATABASE_URL: @database_url ✓
  - JWT_SECRET: @jwt_secret ✓
  - NODE_ENV: production ✓

### Files Modified (15 Total)

**Configuration:** 1 file
- vercel.json ✓

**Error Handling:** 1 file
- src/server.ts ✓

**Routes:** 13 files
1. src/modules/auth/auth.routes.ts ✓
2. src/modules/students/student.routes.ts ✓
3. src/modules/classes/class.routes.ts ✓
4. src/modules/subjects/subject.routes.ts ✓
5. src/modules/teachers/teacher.routes.ts ✓
6. src/modules/teacherSubjects/teacherSubject.routes.ts ✓
7. src/modules/exams/exam.routes.ts ✓
8. src/modules/marks/marks.routes.ts ✓
9. src/modules/results/result.routes.ts ✓
10. src/modules/reports/report.routes.ts ✓
11. src/modules/notifications/notification.routes.ts ✓
12. src/modules/audit/audit.routes.ts ✓

### No Breaking Changes
- [x] No business logic modified
- [x] No authentication logic changed
- [x] No database operations modified
- [x] All error handlers preserved
- [x] All existing functionality preserved

---

## Post-Push Verification (Do This After Deployment)

### 1. Monitor Vercel Build
```
Expected time: 2-3 minutes
Location: https://vercel.com/dashboard → Projects → your-project
```

Checklist:
- [ ] Build started automatically
- [ ] Build succeeded (no errors)
- [ ] Deployment completed
- [ ] Domain is live

### 2. Test API Endpoints

**Health Check:**
```bash
curl https://your-domain/api/health
# Expected: {"status":"OK","message":"API and Database are healthy","timestamp":"..."}
```

**Root Endpoint:**
```bash
curl https://your-domain/
# Expected: {"success":true,"message":"EduTrack API is running","version":"1.0.0",...}
```

**API Info:**
```bash
curl https://your-domain/api
# Expected: {"success":true,"message":"EduTrack Examination Management System API",...}
```

### 3. Verify Error Handling

**Test 404 Error:**
```bash
curl https://your-domain/api/nonexistent
# Expected: 404 with JSON error response
```

**Test 500 Error (trigger via invalid request):**
```bash
curl -X POST https://your-domain/api/login -H "Content-Type: application/json" -d '{"invalid":"data"}'
# Expected: 400/500 with JSON error response (not FUNCTION_INVOCATION_FAILED)
```

### 4. Check Logs

In Vercel Dashboard:
- [ ] Go to Deployments → Latest
- [ ] Click "Logs"
- [ ] Search for "[CRITICAL]" errors
- [ ] Should see NO unhandled rejection errors
- [ ] Health checks should pass

### 5. Functional Tests

**Authentication:**
- [ ] Login endpoint works
- [ ] JWT tokens issued correctly
- [ ] Refresh token works

**Core Operations:**
- [ ] GET /api/students (or any GET endpoint)
- [ ] POST /api/students (or any POST endpoint)
- [ ] UPDATE operation
- [ ] DELETE operation

---

## Environment Variables Setup

**Required in Vercel Dashboard:**

Settings → Environment Variables

```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

Make sure these are set to:
- [ ] Production (not Preview)
- [ ] Deployment correctly linked

---

## Rollback Plan (If Issues Arise)

If deployment fails, you can:

1. **Check Vercel Logs:**
   - Look for build errors
   - Look for runtime errors
   - Most common: missing environment variables

2. **Verify Environment Variables:**
   - DATABASE_URL is set correctly
   - JWT_SECRET is set correctly
   - No special characters causing issues

3. **Clear Cache and Redeploy:**
   - Vercel Dashboard → Deployments → Redeploy (top right)
   - This forces a fresh build

4. **Restore Previous Version:**
   - Vercel Dashboard → Deployments
   - Click on previous deployment
   - Click "Promote to Production"

---

## Success Indicators

✅ **Your website is working when:**
1. No `FUNCTION_INVOCATION_FAILED` errors in logs
2. API endpoints return proper responses (not 500)
3. Health check endpoint responds: `{"status":"OK",...}`
4. All routes respond with JSON (not HTML error pages)
5. Error responses have correct status codes (400, 401, 404, 500)
6. Database connections work
7. Authentication works

---

## Support

If issues persist:
1. Check `/api/health` endpoint
2. Review Vercel logs
3. Verify environment variables
4. Check database connection
5. Open GitHub Issues with error details

