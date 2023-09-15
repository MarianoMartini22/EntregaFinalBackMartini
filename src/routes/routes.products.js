import express from 'express';
import ProductManagerMongo from '../controllers/mongoDB/controllers.products.js';
import ProductManagerFS from '../controllers/fileSystem/controllers.products.js';
import dotenv from 'dotenv';
import isAuth from '../middlewares/isAuth.js';
import config from '../utils/config.js';
import currentMiddleware from '../middlewares/current.js';

dotenv.config();

let productManager = null;

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

productsRoute.use(isAuth);
// Listar todos los productos
productsRoute.get('/', async (req, res) => {
  try {
    const baseURL = 'http://localhost:8080/api/products';
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort ? req.query.sort : 'asc';
    const filter = req.query.filter ? req.query.filter : null;
    const filterValue = req.query.filterValue ? req.query.filterValue : null;
    const products = await productManager.getProducts(limit, page, sort, filter, filterValue);
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
    res.status(200).json(finalProducts);
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
productsRoute.post('/', currentMiddleware, async (req, res) => {
  try {
    if (req.userRole === "admin") {
      await productManager.addProduct(req.body);
      const products = await productManager.getProducts();
      req.socketServer.sockets.emit('actualizarProductos', products.docs);
      res.status(201).json({ message: 'Producto agregado correctamente.' });
      return;
    }
    return res.status(403).json({ message: "No tienes permiso para crear un producto" });
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar el producto.', detailError: error.message });
  }
});

// Actualizar un producto por su ID
productsRoute.put('/:pid', currentMiddleware, async(req, res) => {
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
productsRoute.delete('/:pid', currentMiddleware, async (req, res) => {
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
