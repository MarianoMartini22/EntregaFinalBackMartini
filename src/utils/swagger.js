// En tu archivo swagger.mjs
import swaggerJSDoc from 'swagger-jsdoc';
import __dirname from './utils.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Curso Backend CoderHouse',
      version: '1.0.0',
      description: 'Esta api es un ecommerce',
    },
  },
  apis: [`${__dirname}/routes/*.js`],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
