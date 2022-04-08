import arg from 'arg';
import { config } from './lib/config';
import { configureServer } from './server';

const args = arg({
  '--port': Number,
  '-p': '--port',
});

const server = configureServer();

server.listen(config.meta.serverPort, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
