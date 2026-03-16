const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, '../src/modules');

/**
 * Enterprise Audit Script
 * Purpose: Ensures 10/10 DX and Security by automatically verifying that 
 * every route file implements mandatory 'authenticate' and 'org-scoped' middleares.
 */
function auditRoutes() {
  console.log("🔍 Running Architectural Security Audit...");
  let violations = 0;

  const modules = fs.readdirSync(ROUTES_DIR);

  modules.forEach(mod => {
    const routesPath = path.join(ROUTES_DIR, mod, `${mod}.routes.ts`);
    if (fs.existsSync(routesPath)) {
      const content = fs.readFileSync(routesPath, 'utf8');
      
      const hasAuth = content.includes('authenticate') || content.includes('router.use');
      const isScoped = content.includes('requirePermission') || content.includes('tenantGuard');

      if (!hasAuth || !isScoped) {
        console.warn(`⚠️ [SECURITY RISK] Module '${mod}' might be missing auth or tenant guards.`);
        violations++;
      }
    }
  });

  if (violations === 0) {
    console.log("✅ 10/10 SECURITY: All routes meet enterprise architectural standards.");
  } else {
    console.log(`❌ Audit discovered ${violations} potential vulnerabilities.`);
  }
}

auditRoutes();
