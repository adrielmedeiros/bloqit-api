export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
  database: {
    uri: process.env.MONGODB_URI,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
});