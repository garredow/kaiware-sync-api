import Fastify from 'fastify';
import verify from 'fastify-auth0-verify';
import { LoggerOptions } from 'pino';
import { config } from './lib/config';

const logger: LoggerOptions = {
  enabled: config.logger.enabled,
  name: 'foxcasts-cloud-api',
  level: config.logger.level,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

export function configureServer() {
  const fastify = Fastify({
    logger: logger as any,
  });

  fastify.register(require('fastify-cors'));

  fastify.register(verify, {
    domain: config.auth0.domain,
    audience: config.auth0.audience,
  });

  fastify.register(function (instance, _options, done) {
    instance.get('/verify', {
      handler: function (request, reply) {
        reply.send(request.user);
      },
      preValidation: instance.authenticate,
    });

    done();
  });

  return fastify;
}
