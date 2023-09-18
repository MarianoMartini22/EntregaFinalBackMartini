import express from 'express';
import CartManagerFS from '../controllers/fileSystem/controllers.carts.js';
import cartManagerMongo from '../controllers/mongoDB/controllers.carts.js';
import dotenv from 'dotenv';
import isAuth from '../middlewares/isAuth.js';

dotenv.config();

// import controllers.products from '../dao/fileSystem/controllers.products.js';
import { initializeLastCartId } from '../utils/helpers.js';
import config from '../utils/config.js';

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
// const productManager = new controllers.products();

// cartRoute.use(isAuth);

cartRoute.get('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);
    const products = cart.products;

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito', detailError: error.message });
  }
});

initializeLastCartId();

cartRoute.post('/', (req, res) => {
  try {
    const user = req.socketServer.user;
    if (!user) res.status(500).json({ detailError: '', error: 'Error al agregar carrito, verifique su usuario' });
    cartManager.createCart(user.user._id);
    res.json({ message: 'Carrito agragado con éxito.' });
  } catch (error) {
    res.status(500).json({ detailError: error.message, error: 'Error al agregar carrito' });
  }
});

cartRoute.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const user = req.socketServer.user;
    const cart = await cartManager.addProductToCart(cId, pId, user.user._id);

    res.json({ message: 'Producto agregado al carrito correctamente.', cart });

  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito', detailError: error.message });
  }
});

cartRoute.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const cart = await cartManager.removeProductFromCart(cId, pId);

    res.json({ message: 'Producto borrado del carrito correctamente.', cart });

  } catch (error) {
    res.status(500).json({ error: 'Error al borrar producto del carrito', detailError: error.message });
  }
});
cartRoute.delete('/:cid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const cart = await cartManager.removeAllProductsFromCart(cId);

    res.json({ message: 'Productos borrados del carrito correctamente.', cart });

  } catch (error) {
    res.status(500).json({ error: 'Error al borrar productos del carrito', detailError: error.message });
  }
});

cartRoute.put('/:cid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const products = req.body.products;
    const cart = await cartManager.updateCart(cId, products);

    res.json({ message: 'Productos actualizados en el carrito correctamente.', cart });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar productos del carrito', detailError: error.message });
  }
});

cartRoute.put('/:cid/products/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const quantity = req.body.quantity;
    const cart = await cartManager.updateCartByQuantity(cId, pId, quantity);

    res.json({ message: 'Productos actualizados en el carrito correctamente.', cart });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar productos del carrito', detailError: error.message });
  }
});

export default cartRoute;
