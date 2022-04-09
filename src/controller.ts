import { FastifyReply, FastifyRequest } from 'fastify';
import { Auth0 } from './lib/auth0';
import { Database } from './lib/database';
import { getUser } from './utils/getUser';
const { version: apiVersion } = require('../package.json');

const db = new Database();

type GetSettingsParams = {
  appId: string;
};
async function getSettings(req: FastifyRequest<{ Params: GetSettingsParams }>, res: FastifyReply) {
  const user = await getUser(req);

  const settings = await db.getSettings(user.id, req.params.appId);

  if (!settings) {
    return res.status(404).send({
      statusCode: 404,
      error: 'NotFound',
      message: `No settings found for ${req.params.appId}`,
    });
  }

  res.send(settings);
}

type UpsertSettingsParams = {
  appId: string;
};
async function upsertSettings(
  req: FastifyRequest<{ Params: UpsertSettingsParams; Body: unknown }>,
  res: FastifyReply
) {
  const user = await getUser(req);

  const result = await db.upsertSettings(user.id, req.params.appId, req.body);

  res.send(result);
}

type DeleteSettingsParams = {
  appId: string;
};
async function deleteSettings(
  req: FastifyRequest<{ Params: DeleteSettingsParams; Body: unknown }>,
  res: FastifyReply
) {
  const user = await getUser(req);

  await db.deleteSettings(user.id, req.params.appId);

  res.status(204);
}

type RefreshTokenBody = {
  refreshToken: string;
  clientId: string;
};
async function refreshToken(req: FastifyRequest<{ Body: RefreshTokenBody }>, res: FastifyReply) {
  try {
    const result = await new Auth0(req.headers.authorization!.slice(7)).refreshToken(
      req.body.clientId,
      req.body.refreshToken
    );

    res.send({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      id_token: result.id_token,
      expires_at: Date.now() + result.expires_in * 1000,
    });
  } catch (err) {
    res.status(500).send(err);
  }
}

async function whoami(req: FastifyRequest, res: FastifyReply) {
  const user = await getUser(req, true);

  res.send(user);
}

async function health(req: FastifyRequest, res: FastifyReply) {
  try {
    res.send({
      healthy: true,
      version: apiVersion,
      dbLatency: await db.testLatency(),
    });
  } catch (err: any) {
    req.log.error(err?.message);
    res.send({
      healthy: false,
      version: apiVersion,
    });
  }
}

export default {
  upsertSettings,
  getSettings,
  deleteSettings,
  refreshToken,
  whoami,
  health,
};
