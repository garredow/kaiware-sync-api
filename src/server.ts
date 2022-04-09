import Fastify from 'fastify';
import verify from 'fastify-auth0-verify';
import { LoggerOptions } from 'pino';
import controller from './controller';
import { config } from './lib/config';

const logger: LoggerOptions = {
  enabled: config.logger.enabled,
  name: 'kaiware-sync-api',
  level: config.logger.level,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

export function configureServer() {
  const fastify = Fastify({
    logger,
  });

  // fastify.register(require('fastify-cors'));

  fastify.register(verify, {
    domain: config.auth0.domain,
    audience: config.auth0.audience,
  });

  fastify.register(function (instance, _options, done) {
    instance.get('/settings/:appId', {
      preValidation: instance.authenticate,
      handler: controller.getSettings,
    });

    instance.put('/settings/:appId', {
      preValidation: instance.authenticate,
      handler: controller.upsertSettings,
    });

    instance.delete('/settings/:appId', {
      preValidation: instance.authenticate,
      handler: controller.deleteSettings,
    });

    instance.get('/whoami', {
      preValidation: instance.authenticate,
      handler: controller.whoami,
    });

    instance.get('/health', {
      handler: controller.health,
    });

    done();
  });

  return fastify;
}
