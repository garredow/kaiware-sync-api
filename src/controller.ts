import { FastifyReply, FastifyRequest } from 'fastify';
import { Database } from './lib/database';
import { getUser } from './utils/getUser';

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

async function whoami(req: FastifyRequest, res: FastifyReply) {
  const user = await getUser(req, true);

  res.send(user);
}

async function health(req: FastifyRequest, res: FastifyReply) {
  try {
    res.send({
      healthy: true,
      dbLatency: await db.testLatency(),
    });
  } catch (err: any) {
    req.log.error(err?.message);
    res.send({
      healthy: false,
    });
  }
}

export default {
  upsertSettings,
  getSettings,
  deleteSettings,
  whoami,
  health,
};
