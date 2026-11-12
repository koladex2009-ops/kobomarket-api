const config = require('./config');
const app = require('./app');
const connectMongo = require('./config/mongo');

const start = async () => {
  await connectMongo();
  app.listen(config.port, () => console.log(`API running on port ${config.port}`));
};

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});