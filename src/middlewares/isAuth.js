import { HttpResponse } from "../utils/http.response.js";

// authMiddleware.js
const httpResponse = new HttpResponse();
const authMiddleware = (req, res, next) => {
    try {
      const isUserAuthenticated = !!req.socketServer.user;
      if (!isUserAuthenticated) {
        return httpResponse.Unauthorized(res, 'Usuario no autenticado');
      }
      next();
    } catch (error) {
      return httpResponse.ServerError(res, 'Ocurrió un error en la app, intente más tarde...');
    }
  };
  
  export default authMiddleware;
  