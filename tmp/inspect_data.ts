import prisma from '../src/utils/prisma'; 
async function main() { 
  try { 
    const orgs = await prisma.organization.findMany();
    console.log('Orgs:', JSON.stringify(orgs, null, 2));
    const users = await prisma.user.findMany();
    console.log('Users:', JSON.stringify(users.map(u => ({ email: u.email, orgId: u.orgId })), null, 2));
  } catch (e) { 
    console.error('FAIL', e); 
  } finally {
    await prisma.$disconnect();
  }
} 
main();
