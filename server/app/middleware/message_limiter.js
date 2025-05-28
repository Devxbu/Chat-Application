const rateLimit = require('express-rate-limit');

// Her IP için mesaj gönderme sınırı
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika süre
  max: 3, // 1 dakikada en fazla 3 istek
  message: {
    status: 429,
    error: 'Çok fazla istek gönderdiniz. Lütfen 1 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true, // Rate limit bilgilerini header olarak döndür
  legacyHeaders: false // X-RateLimit-* header'larını kapat
});

module.exports = messageLimiter;
