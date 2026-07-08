const { redisClient } = require('./lib/redis/client');

async function main() {
  const data = await redisClient.hgetall("wc:country");
  console.log('Redis wc:country:', data);
  process.exit(0);
}
main().catch(console.error);
