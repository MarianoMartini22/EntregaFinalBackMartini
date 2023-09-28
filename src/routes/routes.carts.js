import express from 'express';
import CartManagerFS from '../controllers/fileSystem/controllers.carts.js';
import cartManagerMongo from '../controllers/mongoDB/controllers.carts.js';
import dotenv from 'dotenv';
import isAuth from '../middlewares/isAuth.js';

dotenv.config();

// import controllers.products from '../dao/fileSystem/controllers.products.js';
import { initializeLastCartId } from '../utils/helpers.js';
import config from '../utils/config.js';
import { HttpResponse } from '../utils/http.response.js';
import ProductController from '../controllers/mongoDB/controllers.products.js';
import TicketController from '../controllers/mongoDB/controllers.ticket.js';
const httpResponse = new HttpResponse();

const cartRoute = express.Router();
/*
**********************
Para alternar las base de datos se puede cambiar el .env (BD).
Posibles valores:
1- fs (filesystem)
2- mongodb
Por defecto será mongoDB
**********************
*/
let cartManager = null;
switch (config.DB) {
  case 'fs':
    cartManager = new CartManagerFS();
    break;
  case 'mongodb':
    cartManager = new cartManagerMongo();
    break;
  default:
    cartManager = new cartManagerMongo();
    break;
}
const productManager = new ProductController();

const ticketManager = new TicketController();

// cartRoute.use(isAuth);

cartRoute.get('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);
    const products = cart.products;

    return httpResponse.Ok(res, products);
  } catch (error) {
    return httpResponse.NotFound(res, 'No se encontró el carrito');
  }
});

initializeLastCartId();

cartRoute.post('/', async (req, res) => {
  try {
    const { user } = req.socketServer.user;
    const cart = await cartManager.getCartByUserId(user._id);
    if (cart) return httpResponse.ServerError(res, 'Error al agregar carrito, ya posee un carrito');
    if (!user._id) return httpResponse.ServerError(res, 'Error al agregar carrito, verifique su usuario');
    cartManager.createCart(user.user._id);
    return httpResponse.Ok(res, { message: 'Carrito agragado con éxito.' });
  } catch (error) {
    console.log(error);
    return httpResponse.ServerError(res, 'Error al agregar carrito');
  }
});

cartRoute.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const user = req.socketServer.user;
    const cart = await cartManager.addProductToCart(cId, pId, user.user._id);

    return httpResponse.Ok(res, { message: 'Producto agregado al carrito correctamente.', cart });

  } catch (error) {
    return httpResponse.ServerError(res, 'Error al agregar producto al carrito');
  }
});

cartRoute.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const cart = await cartManager.removeProductFromCart(cId, pId);
    return httpResponse.Ok(res, { message: 'Producto borrado del carrito correctamente.', cart });
  } catch (error) {
    return httpResponse.ServerError(res, 'Error al borrar producto del carrito');
  }
});
cartRoute.delete('/:cid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const cart = await cartManager.removeAllProductsFromCart(cId);
    return httpResponse.Ok(res, { message: 'Productos borrados del carrito correctamente.', cart });
  } catch (error) {
    return httpResponse.ServerError(res, 'Error al borrar productos del carrito');
  }
});

cartRoute.put('/:cid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const products = req.body.products;
    const cart = await cartManager.updateCart(cId, products);
    return httpResponse.Ok(res, { message: 'Productos actualizados en el carrito correctamente.', cart });

  } catch (error) {
    return httpResponse.ServerError(res, 'Error al actualizar productos del carrito');
  }
});

cartRoute.put('/:cid/products/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const quantity = req.body.quantity;
    const cart = await cartManager.updateCartByQuantity(cId, pId, quantity);
    return httpResponse.Ok(res, { message: 'Productos actualizados en el carrito correctamente.', cart });

  } catch (error) {
    return httpResponse.ServerError(res, 'Error al actualizar productos del carrito');
  }
});

cartRoute.post('/:cid/purchase', async (req, res) => {
  try {
    const cId = req.params.cid;
    const cart = await cartManager.getCartById(cId);
    const { _id } = req.socketServer.user.user;
    cart.products.map(async (prod) => {
      if (prod.quantity > prod.product._doc.stock) {
        await cartManager.deleteProductFromCart(cId, prod.product._id);
      } else {
        await productManager.updateProduct(prod.product._id, {...prod.product._doc, stock: prod.product.stock - prod.quantity});
      }
    });
    await ticketManager.generateTicket(_id, cart);
    return httpResponse.Ok(res, { message: 'Carrito comprado con éxito.' });
  } catch (error) {
    return httpResponse.ServerError(res, 'Error al comprar el carrito', error);
  }
});

export default cartRoute;
