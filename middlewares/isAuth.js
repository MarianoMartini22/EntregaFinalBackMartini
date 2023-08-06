// authMiddleware.js
const authMiddleware = (req, res, next) => {
    try {
      const isUserAuthenticated = !!req.socketServer.user;
      if (!isUserAuthenticated) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      next();
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Ocurrió un error en la app, intente más tarde...' });
    }
  };
  
  export default authMiddleware;
  