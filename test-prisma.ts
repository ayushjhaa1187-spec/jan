import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findFirst();
    if (user) {
        console.log('User orgId:', user.orgId);
    }
}
main();
