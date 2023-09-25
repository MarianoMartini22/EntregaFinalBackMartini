import express from 'express';
import ProductManagerFS from '../controllers/fileSystem/controllers.products.js';
import ProductManagerMongo from '../controllers/mongoDB/controllers.products.js';
import CartManagerFS from '../controllers/fileSystem/controllers.carts.js';
import CartManagerMongo from '../controllers/mongoDB/controllers.carts.js';
import UserManagerMongo from '../controllers/mongoDB/controllers.user.js';
import isAuth from '../middlewares/isAuth.js';
import passport from 'passport';
import config from '../utils/config.js';
import currentMiddleware from '../middlewares/current.js';
import { HttpResponse } from '../utils/http.response.js';
const httpResponse = new HttpResponse();

let productManager = null;
let userManager = new UserManagerMongo();

switch (config.DB) {
  case 'fs':
    productManager = new ProductManagerFS();
    break;
  case 'mongodb':
    productManager = new ProductManagerMongo();
    break;
  default:
    productManager = new ProductManagerMongo();
    break;
}
let cartManager = null;

switch (config.DB) {
  case 'fs':
    cartManager = new CartManagerFS();
    break;
  case 'mongodb':
    cartManager = new CartManagerMongo();
    break;
  default:
    cartManager = new CartManagerMongo();
    break;
}

/*
**********************
Para alternar las base de datos se puede cambiar el .env (BD).
Posibles valores:
1- fs (filesystem)
2- mongodb
Por defecto será mongoDB
**********************
*/


const viewsRoute = express.Router();

viewsRoute.get('/register', async (req, res) => {
  if (!!req.socketServer.user) {
    res.redirect('/productos');
    return;
  }
  try {
    res.render('register');
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener la vista registro');
  }
});

viewsRoute.get('/login', async (req, res) => {
  if (!!req.socketServer.user) {
    res.redirect('/productos');
    return;
  }
  try {
    res.render('login');
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener la vista login');
  }
});

viewsRoute.post('/login', (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {
    if (err) {
      return next(err);
    }
    setTimeout(() => {
      req.socketServer.sockets.emit('loginUsuario', user);
    }, 1);
    if (!user.ok) {
      return res.redirect('/login');
    }
    req.socketServer.user = user;
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/productos');
    });
  })(req, res, next);
});

viewsRoute.post('/register', (req, res, next) => {
  passport.authenticate('register', (err, user, info) => {
    setTimeout(() => {
      req.socketServer.sockets.emit('registrarUsuario', user);
    }, 1);
    if (err) {
      return next(err);
    }
    if (!user.ok) {
      return res.redirect('/register');
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/login');
    });
  })(req, res, next);
});

viewsRoute.get(
  "/login-github",
  passport.authenticate("auth0", {
    scope: "openid email profile"
  }),
  (req, res) => {
    res.redirect("/productos");
  }
);

viewsRoute.get("/callback", (req, res, next) => {
  passport.authenticate("auth0", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.socketServer.user = user;
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      delete req.session.returnTo;
      res.redirect(`/productos`);
    });
  })(req, res, next);
});

viewsRoute.use(isAuth);


viewsRoute.get('/productos', async (req, res) => {
  try {
    const baseURL = 'http://localhost:8080/api/products';
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort ? req.query.sort : 'asc';
    const filter = req.query.filter ? req.query.filter : null;
    const filterValue = req.query.filterValue ? req.query.filterValue : null;
    const products = await productManager.getProducts(limit, page, sort, filter, filterValue);
    req.socketServer.sockets.emit('actualizarProductos', products);
    const plainProducts = products.docs.map((product) => product.toObject({ virtuals: true }));
    const prevPageNumber = products.prevPage;
    const nextPageNumber = products.nextPage;
    const canLogin = req.query.user;
    if (req.socketServer.user) req.socketServer.sockets.emit('loginGithub', req.socketServer.user.nickname);
    let prevLink;
    let nextLink;
    if (prevPageNumber) {
      prevLink = `${baseURL}?page=${prevPageNumber}`;
    } else {
      prevLink = null;
    }
    if (nextPageNumber) {
      nextLink = `${baseURL}?page=${nextPageNumber}`;
    } else {
      nextLink = null;
    }
    const finalProducts = {
      status: 'success',
      payload: plainProducts,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      hasPrevPage: (prevPageNumber) ? true : false,
      hasNextPage: (nextPageNumber) ? true : false,
      page: (!Number(products.page)) ? 1 : products.page,
      prevLink,
      nextLink
    }
    res.render('home', {
      products: finalProducts.payload,
      currentPage: page,
      totalPages: finalProducts.totalPages,
      hasNextPage: finalProducts.hasNextPage,
      hasPrevPage: finalProducts.hasPrevPage,
      nextPage: finalProducts.nextPage,
      prevPage: finalProducts.prevPage,
      user: canLogin,
      limit
    });
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener los productos');
  }
});

viewsRoute.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    res.render('realtimeproducts', { products: products.docs.map((product) => product.toObject({ virtuals: true })) });
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener los productos');
  }
});

viewsRoute.get('/carts/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);
    if (!cart) return httpResponse.NotFound(res, 'No hay un carrito con esa id');
    const products = cart.products.map((prod) => {
      return { product: prod.product.toJSON(), quantity: prod.quantity }
    });
    res.render('carrito', { products });
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener la vista del carrito');
  }
});


viewsRoute.get('/chat', async (req, res) => {
  try {
    const user = req.socketServer.user;
    res.render('chat', { user: user.user.email });
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener los chats');
  }
});

viewsRoute.get('/current', async (req, res) => {
  try {
    const canLogin = req.socketServer.user;
    const user = await userManager.getUserById(canLogin.user._id);
    res.render('current', { user });
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener el usuario actual');
  }
});

viewsRoute.get('/producto-details/:pid', async (req, res) => {

});

export default viewsRoute;
