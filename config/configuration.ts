export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3001,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  cookiePolicy: {
    sameSite: process.env.SAME_SITE,
  },
});
