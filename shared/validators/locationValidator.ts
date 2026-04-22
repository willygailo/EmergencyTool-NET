import { z } from 'zod';

export const locationValidator = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
});

export const emergencyValidator = z.object({
  type: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().optional(),
});

export const userValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  barangay: z.string().optional(),
});

export const broadcastValidator = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  barangay: z.string().optional(),
  type: z.enum(['alert', 'warning', 'info', 'evacuation']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

export const familyMemberValidator = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

export const checkInValidator = z.object({
  status: z.enum(['safe', 'checking', 'unknown']),
  message: z.string().optional(),
});

export default {
  locationValidator,
  emergencyValidator,
  userValidator,
  broadcastValidator,
  familyMemberValidator,
  checkInValidator,
};