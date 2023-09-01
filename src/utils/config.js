import "dotenv/config";

export default {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT,
    DB :  process.env.DB,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL,
};