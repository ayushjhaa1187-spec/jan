import { NextFunction, Request, Response } from 'express'
import { userService } from './user.service'
import { success } from '../../utils/apiResponse'

export const getOrganizationUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.orgId
    const users = await userService.getUsersByOrg(orgId)
    return res.json(success(users))
  } catch (error) {
    return next(error)
  }
}

export const createOrganizationUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.orgId
    const { name, email, phone, role } = req.body
    
    const user = await userService.createUser({ name, email, phone, role, orgId })
    return res.status(201).json(success(user, 'User created successfully'))
  } catch (error) {
    return next(error)
  }
}
