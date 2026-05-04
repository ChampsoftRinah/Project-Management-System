export const authConfig = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret',
  expiration: '1d',
  algorithm: 'HS256',
};
