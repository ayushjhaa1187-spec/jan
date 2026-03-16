const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Usage: node scaffold-module.js <moduleName>");
  process.exit(1);
}

const baseDir = path.join(__dirname, '../src/modules', moduleName);

const directories = [
  '',
  'controllers',
  'services',
  'routes'
];

const files = {
  [`${moduleName}.types.ts`]: `export interface ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} { id: string; }`,
  [`services/${moduleName}.service.ts`]: `import prisma from '../../../utils/prisma';\n\nexport const ${moduleName}Service = {};`,
  [`controllers/${moduleName}.controller.ts`]: `import { Request, Response } from 'express';\nimport { ${moduleName}Service } from '../services/${moduleName}.service';\n\nexport const ${moduleName}Controller = {};`,
  [`routes/${moduleName}.routes.ts`]: `import { Router } from 'express';\nimport { ${moduleName}Controller } from '../controllers/${moduleName}.controller';\n\nconst router = Router();\n\nexport default router;`
};

console.log(`🚀 Scaffolding module: ${moduleName}...`);

directories.forEach(dir => {
  const dirPath = path.join(baseDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

Object.entries(files).forEach(([file, content]) => {
  const filePath = path.join(baseDir, file);
  fs.writeFileSync(filePath, content);
  console.log(`Created file: ${filePath}`);
});

console.log(`\n✅ Module ${moduleName} ready for implementation!`);
console.log(`Note: Remember to register the new routes in src/routes/index.ts.`);
