const express = require('express');
const ProductManager = require('../managers/ProductManager');
const filePath = './data/productos.json';

const productManager = new ProductManager(filePath);

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
    res.status(500).json({ error: 'Ocurrió un error al obtener el producto.', detailError: error.message  });
  }
});

// Agregar un nuevo producto
productsRoute.post('/', (req, res) => {
  try {
    productManager.addProduct(req.body);
    res.status(201).json({ message: 'Producto agregado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar el producto.', detailError: error.message });
  }
});

// Actualizar un producto por su ID
productsRoute.put('/:pid', (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    productManager.updateProduct(pid, req.body);
    res.json({ message: 'Producto actualizado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el producto.', detailError: error.message });
  }
});

// Eliminar un producto por su ID
productsRoute.delete('/:pid', (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    productManager.deleteProduct(pid);
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar el producto.', detailError: error.message });
  }
});

module.exports = productsRoute;
