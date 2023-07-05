import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import __dirname from './utils/utils.js';
import { Server } from 'socket.io';

const app = express();
const PORT = 8080;

const router = express.Router();
import productsRoute from './routes/ProductsRoute.js';
import cartRoute from './routes/CartsRoute.js';
import viewsRouter from './routes/ViewsRouter.js';

const httpServer = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const socketServer = new Server(httpServer);

/* configuracion handlebars */
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
/* fin configuracion handlebars */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
socketServer.on('connect', () => {
  console.log('Conexión establecida con el servidor Socket.io');
});

app.use((req, res, next) => {
  req.socketServer = socketServer;
  next();
});

app.get('/', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'La api funciona',
  });
});

app.use(router);
app.use('/', viewsRouter);
app.use('/api/products', productsRoute);
app.use('/api/carts', cartRoute);
