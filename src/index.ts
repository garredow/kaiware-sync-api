import { config } from './lib/config';
import { configureServer } from './server';

const server = configureServer();

server.listen(config.meta.serverPort, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
