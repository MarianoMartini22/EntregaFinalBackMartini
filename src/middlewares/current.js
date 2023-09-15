const currentMiddleware = (req, res, next) => {
    try {
        const user = req.socketServer.user;

        if (!user) {
            return res.status(401).json({ message: "No tienes permiso para acceder a esta ruta" });
        }

        if (user.role === "admin") {
            req.userRole = "admin";
        } else {
            req.userRole = "usuario";
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default currentMiddleware;
