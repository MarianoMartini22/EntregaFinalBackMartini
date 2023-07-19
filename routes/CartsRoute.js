import express from 'express';
import CartManagerFS from '../dao/fileSystem/CartManager.js';
import cartManagerMongo from '../dao/mongoDB/CartManager.js';
import dotenv from 'dotenv';

dotenv.config();

// import ProductManager from '../dao/fileSystem/ProductManager.js';
import { initializeLastCartId } from '../helpers.js';

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
switch (process.env.DB) {
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
// const productManager = new ProductManager();

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
    cartManager.createCart();
    res.json({ message: 'Carrito agragado con éxito.' });
  } catch (error) {
    res.status(500).json({ detailError: error.message, error: 'Error al agregar carrito' });
  }
});

cartRoute.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    
    const cart = await cartManager.addProductToCart(cId, pId);

    res.json({ message: 'Producto agregado al carrito correctamente.', cart });

  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito', detailError: error.message });
  }
});

export default cartRoute;
