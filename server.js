import express from 'express';
import dotenv from 'dotenv';
import { engine } from 'express-handlebars';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import Handlebars from 'handlebars';

import productsRoute from './routes/ProductsRoute.js';
import cartRoute from './routes/CartsRoute.js';
import viewsRouter from './routes/ViewsRouter.js';
import dbConnection from './utils/db.js';

import ChatManager from './dao/mongoDB/ChatManager.js';

dotenv.config();

const chatManager = new ChatManager();
const app = express();
const PORT = process.env.PORT;
const httpServer = createServer(app);
const socketServer = new Server(httpServer);

/* configuracion handlebars */
Handlebars.registerHelper('displayId', function (product) {
  return product.id ? product.id : product._id;
});
app.engine('handlebars', engine({
  allowProtoProperties: true,
  helpers: {
    JSONstringify: (context) => JSON.stringify(context),
    JSONparse: (context) => JSON.parse(context),
  }
}));

app.set('view engine', 'handlebars');
app.set('views', './views');
/* fin configuracion handlebars */

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

socketServer.on('connect', (socket) => {
  console.log('Usuario conectado con el servidor Socket.io');

  socket.on('saveMessage', async (msg) => {
    const savedMessage = await chatManager.saveMessage(msg);
    socketServer.emit('saveMessage', savedMessage);
  });

  socket.on('uploadChats', async () => {
    const messages = await chatManager.getMessages();
    socketServer.emit('uploadChats', messages);
  });
  socket.on('actualizarProductos', async (products) => {
    socketServer.emit('actualizarProductos', products);
  });

  // Manejar la desconexión de un cliente
  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado.');
  });
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

app.use(viewsRouter);
app.use('/api/products', productsRoute);
app.use('/api/carts', cartRoute);

httpServer.listen(PORT, () => {
  console.log(`Server corriendo en puerto ${PORT}\nConexión vía ${process.env.DB}`);
  dbConnection();
});
