/**
 * Event routes
 * Public: list events, get event by ID
 * Protected (admin only): create, update, delete
 */

import { Router } from 'express';
import { EventController } from './event.controller';
import { validateBody, validateQuery } from '../../core/middleware/validation.middleware';
import { createEventSchema, updateEventSchema, eventQuerySchema } from '@ticketing-platform/shared';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { UserRole } from '@ticketing-platform/shared';
import { validateObjectId } from '../../core/middleware/objectId.middleware';

const router = Router();
const eventController = new EventController();

// Public routes
router.get('/', validateQuery(eventQuerySchema), eventController.list);
router.get('/:id', validateObjectId('id'), eventController.getById);

// Protected routes (admin only)
router.post(
  '/',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validateBody(createEventSchema),
  eventController.create
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validateObjectId('id'),
  validateBody(updateEventSchema),
  eventController.update
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  validateObjectId('id'),
  eventController.delete
);

export default router;
