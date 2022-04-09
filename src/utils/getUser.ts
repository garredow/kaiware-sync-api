import { FastifyRequest } from 'fastify';
import fetch from 'node-fetch';
import { config } from '../lib/config';
import { UserInfo } from '../models';

export async function getUser(req: FastifyRequest, includeInfo = false): Promise<UserInfo> {
  const result: UserInfo = {
    id: (req.user as any).sub,
  };

  if (includeInfo) {
    const data = await fetch(`${config.auth0.domain}/userInfo`, {
      headers: { Authorization: req.headers.authorization! },
    }).then((res) => res.json());

    result.email = data.email;
    result.email_verified = data.email_verified;
    result.name = data.name;
    result.nickname = data.nickname;
    result.picture = data.picture;
    result.updated_at = data.updated_at;
  }

  return result;
}
