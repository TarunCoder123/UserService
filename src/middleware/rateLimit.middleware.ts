import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false,  
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
});


// This is the custom rate limit which I can use
// // Store request timestamps per user (IP in this case)
// const rateLimitStore = new Map();

// function customRateLimiter({ windowMs, maxRequests }) {
//   return (req, res, next) => {
//     const userKey = req.ip; // You can change this to req.headers['x-api-key'] or token
//     const currentTime = Date.now();

//     if (!rateLimitStore.has(userKey)) {
//       rateLimitStore.set(userKey, []);
//     }

//     // Get timestamps for this user
//     const timestamps = rateLimitStore.get(userKey);

//     // Filter out timestamps that are older than the window
//     const updatedTimestamps = timestamps.filter(ts => currentTime - ts < windowMs);

//     // If under limit, allow request and store timestamp
//     if (updatedTimestamps.length < maxRequests) {
//       updatedTimestamps.push(currentTime);
//       rateLimitStore.set(userKey, updatedTimestamps);
//       next();
//     } else {
//       // Too many requests
//       res.status(429).json({
//         message: `Rate limit exceeded. Try again later.`,
//       });
//     }
//   };
// }

// module.exports = customRateLimiter;

