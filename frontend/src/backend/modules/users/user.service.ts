import AppError from '../../utils/AppError'
import prisma from '../../utils/prisma'
import bcrypt from 'bcryptjs'

const BCRYPT_SALT_ROUNDS = 12

export const userService = {
  async getUsersByOrg(orgId: string) {
    const users = await prisma.user.findMany({
      where: { orgId },
      include: {
        userRoles: { include: { role: true } },
        teacherProfile: true,
        staffProfile: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      isActive: u.isActive,
      role: u.userRoles[0]?.role.name || 'User',
      name: u.teacherProfile 
        ? `${u.teacherProfile.firstName} ${u.teacherProfile.lastName}`
        : u.staffProfile 
          ? `${u.staffProfile.firstName} ${u.staffProfile.lastName}`
          : u.email.split('@')[0],
      createdAt: u.createdAt,
    }))
  },

  async createUser(data: { name: string; email: string; phone: string; role: string; orgId: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) {
      throw new AppError('Email already in use', 400)
    }

    let roleRecord = await prisma.role.findUnique({ where: { name: data.role } })
    if (!roleRecord) {
      roleRecord = await prisma.role.create({ data: { name: data.role } })
    }

    const hashedPassword = await bcrypt.hash('welcome123', BCRYPT_SALT_ROUNDS)

    const names = data.name.split(' ')
    const firstName = names[0] || ''
    const lastName = names.slice(1).join(' ') || ''

    // Unique prefix for employee ID based on role
    const prefix = data.role.toUpperCase().substring(0, 3)
    const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase()
    const employeeId = `${prefix}-${uniqueId}`

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        orgId: data.orgId,
        userRoles: {
          create: {
            roleId: roleRecord.id
          }
        },
        // For Teacher and OfficeStaff, we'll create the respective profiles
        ...(data.role === 'Teacher' && {
          teacherProfile: {
            create: {
              firstName,
              lastName,
              employeeId,
              orgId: data.orgId
            }
          }
        }),
        ...((['OfficeStaff', 'Principal', 'ExamDept'].includes(data.role)) && {
          staffProfile: {
            create: {
              firstName,
              lastName,
              employeeId,
              orgId: data.orgId
            }
          }
        })
      }
    })

    return { id: user.id, email: user.email, role: data.role }
  }
}
