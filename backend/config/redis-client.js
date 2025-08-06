const redis = require('redis');

const redisClient = redis.createClient({
  legacyMode: true, // important for using .get/.set
  url: 'redis://localhost:6379' 
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
