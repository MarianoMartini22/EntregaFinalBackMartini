import { HttpResponse } from "../utils/http.response.js";
import { logger } from "../utils/logger.js";

// authMiddleware.js
const httpResponse = new HttpResponse();
const authMiddleware = (req, res, next) => {
    try {
      if (process.env.ENVIRONMENT === 'TESTING') {
        next();
        return; 
      }
      const isUserAuthenticated = !!req.socketServer.user;
      if (!isUserAuthenticated) {
        logger.error('Usuario no autenticado');
        return httpResponse.Unauthorized(res, 'Usuario no autenticado');
      }
      next();
    } catch (error) {
      logger.fatal('Ocurrió un error en la app, intente más tarde...');
      return httpResponse.ServerError(res, 'Ocurrió un error en la app, intente más tarde...');
    }
  };
  
  export default authMiddleware;
  