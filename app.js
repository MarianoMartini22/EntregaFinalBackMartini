import express from 'express';
import ProductManager from './ProductManager.js';

const app = express();
const port = 8080;

// Crear una instancia de ProductManager
const filePath = './productos.json';
const productManager = new ProductManager(filePath);

/* productManager.addProduct({
  title: 'Chupetines',
  description: 'Leritier de frutilla',
  price: 10,
  thumbnail: 'imagen1.jpg',
  code: 'CODE001',
  stock: 20,
});
productManager.addProduct({
  title: 'Alfajor',
  description: 'Milka triple',
  price: 15,
  thumbnail: 'imagen2.jpg',
  code: 'CODE002',
  stock:10,
});
productManager.addProduct({
title: 'Barra de chocolate',
description: 'Cofler aireado',
price: 20,
thumbnail: 'imagen3.jpg',
code: 'CODE003',
stock: 5,
});
productManager.addProduct({
  title: 'Caramelo',
  description: 'Sabor miel',
  price: 12,
  thumbnail: 'imagen4.jpg',
  code: 'CODE004',
  stock: 510,
});
productManager.addProduct({
  title: 'Caramelo Flynpaff',
  description: 'Sabor frutilla',
  price: 30,
  thumbnail: 'imagen5.jpg',
  code: 'CODE005',
  stock: 300,
});
productManager.addProduct({
  title: 'Gomitas',
  description: 'Mogul multifruta',
  price: 100,
  thumbnail: 'imagen6.jpg',
  code: 'CODE006',
  stock: 80,
});
productManager.addProduct({
  title: 'Galletitas Oreo',
  description: 'Galletitas rellenas',
  price: 150,
  thumbnail: 'imagen7.jpg',
  code: 'CODE007',
  stock: 45,
});
productManager.addProduct({
  title: 'Chicles Beldent',
  description: 'Sabor menta',
  price: 210,
  thumbnail: 'imagen8.jpg',
  code: 'CODE008',
  stock: 110,
});
productManager.addProduct({
  title: 'Coca Cola',
  description: 'Gaseosa sabor cola 600cc',
  price: 270,
  thumbnail: 'imagen9.jpg',
  code: 'CODE009',
  stock: 38,
});
productManager.addProduct({
  title: 'Galletitas Don Satur',
  description: 'Galletitas agridulces',
  price: 110,
  thumbnail: 'imagen10.jpg',
  code: 'CODE0010',
  stock: 55,
}); */

// Endpoint para obtener todos los productos o un número limitado de productos
app.get('/products', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.' });
  }
});

// Endpoint para obtener un producto por su ID
app.get('/products/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const product = await productManager.getProductById(pid);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener el producto.' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
