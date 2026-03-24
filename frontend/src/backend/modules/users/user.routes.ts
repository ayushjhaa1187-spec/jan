import { Router } from 'express'
import { requireAuth, requireRole } from '../auth/auth.middleware'
import asyncHandler from '../../utils/asyncHandler'
import { getOrganizationUsers, createOrganizationUser } from './user.controller'

const router = Router()

// Only Principals can manage users, so we can require the 'Principal' role.
router.use(requireAuth)
router.use(requireRole('Principal'))

router.get('/', asyncHandler(getOrganizationUsers))
router.post('/', asyncHandler(createOrganizationUser))

export default router
