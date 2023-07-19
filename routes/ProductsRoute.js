import express from 'express';
import ProductManagerMongo from '../dao/mongoDB/ProductManager.js';
import ProductManagerFS from '../dao/fileSystem/ProductManager.js';
import dotenv from 'dotenv';

dotenv.config();

let productManager = null;

switch (process.env.DB) {
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
// Manejo de rutas para productos
const productsRoute = express.Router();

/*
**********************
Para alternar las base de datos se puede cambiar el .env (BD).
Posibles valores:
1- fs (filesystem)
2- mongodb
Por defecto será mongoDB
**********************
*/


// Listar todos los productos
productsRoute.get('/', async (req, res) => {
  try {
    /*
    const page = Number( req.query.page );
    const sort = req.query.sort;
    const filter = req.query.filter;
    const filterValue = req.query.filterValue; */
    const limit = Number( req.query.limit );
    const products = await productManager.getProducts(
      limit,
      /* page,
      sort,
      filter,
      filterValue */
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.', detailError: error.message });
  }
});

// Obtener un producto por su ID
productsRoute.get('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
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
    await productManager.addProduct(req.body);
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
    const pid = req.params.pid;
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
    const pid = req.params.pid;
    await productManager.deleteProduct(pid);
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar el producto.', detailError: error.message });
  }
});

export default productsRoute;
