import express from 'express';
import CartManager from '../dao/fileSystem/CartManager.js';
import ProductManager from '../dao/fileSystem/ProductManager.js';
import { generateNewCartId, initializeLastCartId } from '../helpers.js';

const cartRoute = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

cartRoute.get('/:cid', (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = cartManager.loadCartData(cid);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado.' });
    }

    if (cart.products.length === 0) {
      return res.status(404).json({ error: 'No hay items en el carrito.' });
    }

    const products = cart.products;

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito', detailError: error.message });
  }
});

initializeLastCartId();

cartRoute.post('/', (req, res) => {
  try {
    const cId = generateNewCartId();
    const cart = {
      id: cId,
      products: [],
    };

    cartManager.saveCartData(cart);
    res.json({ message: 'Productos agregados al carrito correctamente.' });
  } catch (error) {
    res.status(500).json({ detailError: error.message, error: 'Error al agregar productos' });
  }
});

cartRoute.post('/:cid/product/:pid', (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;

    const isValidProduct = productManager.getProductById(pId);

    if (!isValidProduct) {
      return res.status(404).json({ error: 'El producto no existe o no es válido.' });
    }

    let cart = cartManager.loadCartData(cId);

    if (!cart) {
      return res.status(404).json({ error: 'El carrito no existe.' });
    }

    const existingProduct = cart.products.find(product => product?.id === pId || product?.product?.id === pId);
    if (existingProduct) {
      existingProduct.product.quantity += 1;
      cartManager.saveCartData(cart, cId);
      res.json({ message: 'Producto agregado al carrito correctamente.' });
    } else {
      const newProduct = {
        id: pId,
        quantity: 1,
      };

      cart.products.push({ product: newProduct });

      cartManager.saveCartData(cart, cId);
      res.json({ message: 'Producto agregado al carrito correctamente.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar carrito', detailError: error.message });
  }
});

export default cartRoute;
