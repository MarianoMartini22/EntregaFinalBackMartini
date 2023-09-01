import express from 'express';
import dotenv from 'dotenv';
import { engine } from 'express-handlebars';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import Handlebars from 'handlebars';

import productsRoute from './routes/routes.products.js';
import cartRoute from './routes/routes.carts.js';
import viewsRouter from './routes/routes.views.js';
import dbConnection from './utils/db.js';
import __dirname from './utils/utils.js';

import ChatController from './controllers/mongoDB/controllers.chats.js';
import UserController from './controllers/mongoDB/controllers.user.js';
import session from 'express-session';
import './passport/local-strategy.js';
import passport from 'passport';
import config from './utils/config.js';

dotenv.config();

const chatManager = new ChatController();
const app = express();
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
app.set('views', path.join(__dirname, 'public/views'));
/* fin configuracion handlebars */
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'Mayu2023',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

socketServer.on('connect', (socket) => {
  console.log('Usuario conectado con el servidor Socket.io');

  socket.on('saveMessage', async (msg) => {
    const savedMessage = await chatManager.saveMessage(msg);
    socketServer.emit('saveMessage', savedMessage);
  });

  socket.on('registrarUsuario', async (user) => {
    socketServer.emit('registrarUsuario', savedUser);
  });

  socket.on('loginUsuario', async (user) => {
    socketServer.emit('loginUsuario', loginUser);
  });

  socket.on('loginGithub', async (user) => {
    socketServer.emit('loginGithub', user);
  });

  socket.on('logout', () => {
    socketServer.user = null;
    socketServer.emit('logout');
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

httpServer.listen(config.PORT, () => {
  console.log(`Server corriendo en puerto ${config.PORT}\nConexión vía ${config.DB}`);
  dbConnection();
});
