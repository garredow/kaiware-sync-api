import { FastifyRequest } from 'fastify';
import { User } from '../models';

export function getUser(req: FastifyRequest): User {
  return {
    id: (req.user as any).sub,
    issued_at: (req.user as any).iat * 1000,
    expires_at: (req.user as any).exp * 1000,
  };
}
