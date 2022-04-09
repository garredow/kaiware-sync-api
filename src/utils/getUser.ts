import { FastifyRequest } from 'fastify';
import { Auth0 } from '../lib/auth0';
import { UserInfo } from '../models';

export async function getUser(req: FastifyRequest, includeInfo = false): Promise<UserInfo> {
  const result: UserInfo = {
    id: (req.user as any).sub,
  };

  if (includeInfo) {
    const userInfo = await new Auth0(req.headers.authorization!.slice(7)).getUserInfo();

    result.email = userInfo.email;
    result.email_verified = userInfo.email_verified;
    result.name = userInfo.name;
    result.nickname = userInfo.nickname;
    result.picture = userInfo.picture;
    result.updated_at = userInfo.updated_at;
  }

  return result;
}
