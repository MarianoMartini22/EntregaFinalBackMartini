import express from 'express';
import ProductManager from '../managers/ProductManager.js';

const productManager = new ProductManager();

// Manejo de rutas para productos
const productsRoute = express.Router();

// Listar todos los productos
productsRoute.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.', detailError: error.message });
  }
});

// Obtener un producto por su ID
productsRoute.get('/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const product = await productManager.getProductById(pid);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener el producto.', detailError: error.message });
  }
});

// Agregar un nuevo producto
productsRoute.post('/', async (req, res) => {
  try {
    productManager.addProduct(req.body);
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    res.status(201).json({ message: 'Producto agregado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar el producto.', detailError: error.message });
  }
});

// Actualizar un producto por su ID
productsRoute.put('/:pid', async(req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    await productManager.updateProduct(pid, req.body);
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    res.json({ message: 'Producto actualizado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el producto.', detailError: error.message });
  }
});

// Eliminar un producto por su ID
productsRoute.delete('/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    productManager.deleteProduct(pid);
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar el producto.', detailError: error.message });
  }
});

export default productsRoute;
