import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugRegister() {
  const schoolCode = `DEBUG-${Date.now()}`;
  const email = `debug-${Date.now()}@test.com`;
  
  try {
    console.log('--- Phase 1: Pre-checks ---');
    const normalizedSchoolCode = schoolCode.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('--- Phase 2: Transaction ---');
    await prisma.$transaction(async (tx) => {
      console.log('Finding Principle Role...');
      let principalRole = await tx.role.findFirst({ where: { name: 'Principal' } });
      if (!principalRole) {
        console.log('Creating Principle Role...');
        principalRole = await tx.role.create({
          data: { name: 'Principal', description: 'Institutional Head' }
        });
      }

      console.log('Seeding Permissions...');
      const mandatoryPermissions = [
        { action: 'MANAGE', resource: 'CLASSES' },
        { action: 'MANAGE', resource: 'STUDENTS' },
        { action: 'MANAGE', resource: 'EXAMS' },
        { action: 'MANAGE', resource: 'MARKS' },
      ];

      for (const p of mandatoryPermissions) {
        console.log(`Processing Permission: ${p.action}_${p.resource}`);
        let permission = await tx.permission.findFirst({
          where: { action: p.action, resource: p.resource }
        });
        if (!permission) {
          console.log(`Creating Permission: ${p.action}_${p.resource}`);
          permission = await tx.permission.create({ data: p });
        }
        
        console.log(`Checking link for ${principalRole.id} - ${permission.id}`);
        const existingLink = await tx.rolePermission.findFirst({
          where: { roleId: principalRole.id, permissionId: permission.id }
        });
        if (!existingLink) {
          console.log(`Creating Link...`);
          await tx.rolePermission.create({
            data: { roleId: principalRole.id, permissionId: permission.id }
          });
        }
      }

      console.log('Creating Organization...');
      const organization = await tx.organization.create({
        data: {
          name: "Debug School",
          schoolCode: normalizedSchoolCode,
        }
      });

      console.log('Hashing Password...');
      const hashedPassword = await bcrypt.hash("Password123!", 12);

      console.log('Creating User and Profiles...');
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          orgId: organization.id,
          userRoles: {
            create: {
              roleId: principalRole.id
            }
          },
          staffProfile: {
            create: {
              employeeId: `DEBUG-ADMIN-${normalizedSchoolCode}`,
              firstName: "Debug",
              lastName: "Admin",
              orgId: organization.id
            }
          }
        }
      });
      console.log('✅ Registration Logic Completed within transaction.');
    });
  } catch (error) {
    console.error('❌ DEBUG FAILED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRegister();
