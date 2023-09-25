import express from 'express';
import ProductManagerMongo from '../controllers/mongoDB/controllers.products.js';
import ProductManagerFS from '../controllers/fileSystem/controllers.products.js';
import dotenv from 'dotenv';
import isAuth from '../middlewares/isAuth.js';
import config from '../utils/config.js';
import currentMiddleware from '../middlewares/current.js';
import { HttpResponse } from '../utils/http.response.js';
const httpResponse = new HttpResponse();
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
    return httpResponse.Ok(res, finalProducts);
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener los productos');
  }
});

// Obtener un producto por su ID
productsRoute.get('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productManager.getProductById(pid);
    if (product) {
      return httpResponse.Ok(res, product);
    } else {
      return httpResponse.NotFound(res, 'Producto no encontrado.');
    }
  } catch (error) {
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener el producto.');
  }
});

// Agregar un nuevo producto
productsRoute.post('/', currentMiddleware, async (req, res) => {
  try {
    if (req.userRole === "admin") {
      await productManager.addProduct(req.body);
      const products = await productManager.getProducts();
      req.socketServer.sockets.emit('actualizarProductos', products.docs);
      return httpResponse.Ok(res, 'Producto agregado correctamente');
    }
    return httpResponse.Unauthorized(res, 'No tienes permiso para crear un producto');
  } catch (error) {
    return httpResponse.ServerError(res, 'Error al agregar el producto');
  }
});

// Actualizar un producto por su ID
productsRoute.put('/:pid', currentMiddleware, async(req, res) => {
  try {
    const pid = req.params.pid;
    await productManager.updateProduct(pid, req.body);
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    return httpResponse.Ok(res, 'Producto actualizado correctamente');
  } catch (error) {
    return httpResponse.ServerError(res, 'Error al actualizar el producto');
  }
});

// Eliminar un producto por su ID
productsRoute.delete('/:pid', currentMiddleware, async (req, res) => {
  try {
    const pid = req.params.pid;
    await productManager.deleteProduct(pid);
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    return httpResponse.Ok(res, 'Producto eliminado correctamente');
  } catch (error) {
    return httpResponse.ServerError(res, 'Error al eliminar el producto');
  }
});

export default productsRoute;
