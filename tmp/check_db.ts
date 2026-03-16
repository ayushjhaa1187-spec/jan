import prisma from '../src/utils/prisma'; 
async function main() { 
  try { 
    await prisma.$queryRaw`SELECT 1`; 
    console.log('DB CONNECTION SUCCESS'); 
    const orgCount = await prisma.organization.count();
    const userCount = await prisma.user.count();
    const roles = await prisma.role.findMany();
    console.log('Orgs:', orgCount, 'Users:', userCount);
    console.log('Roles:', roles.map(r => r.name).join(', '));
  } catch (e) { 
    console.error('DB CONNECTION FAILURE', e); 
  } finally {
    await prisma.$disconnect();
  }
} 
main();
