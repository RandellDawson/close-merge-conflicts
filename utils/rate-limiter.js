const rateLimiter = (delay = 1500) => {
  return new Promise(resolve => setTimeout(() => resolve(true), delay));
};

module.exports = { rateLimiter };
