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
import ticketRoute from './routes/routes.ticket.js';
import viewsRouter from './routes/routes.views.js';
import dbConnection from './utils/db.js';
import __dirname from './utils/utils.js';

import ChatController from './controllers/mongoDB/controllers.chats.js';
import UserController from './controllers/mongoDB/controllers.user.js';
import session from 'express-session';
import './passport/local-strategy.js';
import passport from 'passport';
import config from './utils/config.js';
import ProductController from './controllers/mongoDB/controllers.products.js';
import { logger } from './utils/logger.js';
import userRoute from './routes/routes.user.js';
import jwt from 'jsonwebtoken';
import comparePasswords from './utils/passwords.js';

dotenv.config();

const chatManager = new ChatController();
const userManager = new UserController();
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
  logger.info('Usuario conectado con el servidor Socket.io.');

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

  socket.on('recoverPassword', async (email) => {
    const user = await userManager.getUserByEmail(email);
    if (!user) {
      socketServer.emit('recoverPasswordError');
      return;
    }
    const postData = {
        email,
    };
    await fetch('http://localhost:8080/api/user/recoverPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
  });

  socket.on('updatePassword', async (data) => {
    const decoded = jwt.verify(data.token, process.env.SECRET_KEY);
    // Accede al valor del email en el objeto decodificado
    const email = decoded.email;
    const user = await userManager.getUserByEmailPassword(email);
    if (data.token === user.token) {
      socketServer.emit('sameTokenError');
      return;
    }
    if (!user) {
      socketServer.emit('updatePasswordError');
      return;
    }
    const canUpdate = await comparePasswords(data.password, user.password);
    if (!canUpdate) {
      socketServer.emit('updateSamePasswordError');
      return;
    }
    userManager.updateUser({...user, password: data.password, token: data.token}).then((res) => {
      if (!res) {
        socketServer.emit('updatePasswordError');
        return;
      }
      socketServer.emit('updatedPassword');
    })
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
    logger.info('Un usuario se ha desconectado.');
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

app.get('/loggerTest', (req, res) => {
  // Ejemplos de registros de diferentes niveles
  logger.debug('Este es un mensaje de depuración.');
  logger.http('Este es un mensaje HTTP.');
  logger.info('Este es un mensaje informativo.');
  logger.warning('Este es un mensaje de advertencia.');
  logger.error('Este es un mensaje de error.');
  logger.fatal({msg: 'Este es un mensaje fatal.', error: 'este es un error especifico que sucedió cuando se ejecutó la petición bla bla'});

  res.send('Registros enviados al logger.');
});

app.use('/api/user', userRoute);
app.use('/api/products', productsRoute);
app.use('/api/carts', cartRoute);
app.use('/api/ticket', ticketRoute);
app.use(viewsRouter);
app.use('/api/mockingproducts', (req, res) => {
  const productController = new ProductController();
  let { cant } = req.query;
  if (!cant) cant = 100;
  const products = productController.createMockProduct(cant);
  if (!products) {
    return res.status(500).json({
      ok: false,
      message: 'No se pudieron crear los productos',
    })
  }
  return res.status(200).json({
    ok: true,
    cantidad_productos: cant,
    products,
  })
});

httpServer.listen(config.PORT, () => {
  logger.info(`Server corriendo en puerto ${config.PORT}\nConexión vía ${config.DB}`);
  dbConnection();
});
