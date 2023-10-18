import express from 'express';
import ProductManagerMongo from '../controllers/mongoDB/controllers.products.js';
import ProductManagerFS from '../controllers/fileSystem/controllers.products.js';
import dotenv from 'dotenv';
import isAuth from '../middlewares/isAuth.js';
import config from '../utils/config.js';
import currentMiddleware from '../middlewares/current.js';
import { HttpResponse } from '../utils/http.response.js';
import { logger } from '../utils/logger.js';
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

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Módulo de Productos.
 */

productsRoute.use(isAuth);
// Listar todos los productos
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *     - Productos
 *     summary: Obtiene la lista de productos.
 *     description: Obtiene una lista de productos con opciones de paginación, filtrado y orden.
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Número de productos por página.
 *         schema:
 *           type: integer
 *         default: 10
 *       - in: query
 *         name: page
 *         description: Número de página.
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: sort
 *         description: Orden de los productos (asc o desc).
 *         schema:
 *           type: string
 *         default: asc
 *       - in: query
 *         name: filter
 *         description: Campo de filtrado.
 *         schema:
 *           type: string
 *       - in: query
 *         name: filterValue
 *         description: Valor de filtrado.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Muestra los productos filtrados.
 *       500:
 *         description: Ocurrió un error al obtener los productos.
 *       401:
 *         description: Usuario no autenticado.
 */
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
    logger.fatal({ msg: 'Ocurrió un error al obtener los productos', error });
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener los productos');
  }
});

// Obtener un producto por su ID
/**
 * @swagger
 * /api/products/{pid}:
 *   get:
 *     tags:
 *     - Productos
 *     summary: Obtiene un producto por su ID.
 *     parameters:
 *       - in: path
 *         name: pid
 *         description: ID del producto.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listado de productos.
 *       500:
 *         description: Ocurrió un error al obtener los productos
 *       401:
 *         description: No se está autorizado a realizar la petición.
 */
productsRoute.get('/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productManager.getProductById(pid);
    if (product) {
      return httpResponse.Ok(res, product);
    } else {
      logger.warning('Producto no encontrado.');
      return httpResponse.NotFound(res, 'Producto no encontrado.');
    }
  } catch (error) {
    logger.fatal({ msg: 'Ocurrió un error al obtener el producto.', error });
    return httpResponse.ServerError(res, 'Ocurrió un error al obtener el producto.');
  }
});

// Agregar un nuevo producto
/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *     - Productos
 *     summary: Agrega un nuevo producto.
 *     description: Agrega un nuevo producto a la base de datos.
 *     requestBody:
 *       description: Datos del producto a agregar.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               thumbnails:
 *                 type: string
 *               code:
 *                 type: string
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto agregado correctamente.
 *       400:
 *         description: No tienes permiso para crear un producto.
 *       500:
 *         description: Error al agregar el producto.
 *       401:
 *         description: No se está autorizado a realizar la petición.
 */


productsRoute.post('/', currentMiddleware, async (req, res) => {
  try {
    if (req.userRole === "admin") {
      await productManager.addProduct(req.body);
      const products = await productManager.getProducts();
      req.socketServer.sockets.emit('actualizarProductos', products.docs);
      return httpResponse.Ok(res, 'Producto agregado correctamente');
    }
    logger.error('No tienes permiso para crear un producto');
    return httpResponse.Unauthorized(res, 'No tienes permiso para crear un producto');
  } catch (error) {
    logger.fatal({ msg: 'Error al agregar el producto', error });
    return httpResponse.ServerError(res, 'Error al agregar el producto');
  }
});

// Actualizar un producto por su ID
/**
 * @swagger
 * /api/products/{pid}:
 *   put:
 *     tags:
 *     - Productos
 *     description: Actualiza un producto existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: pid
 *         description: ID del producto a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Datos del producto a actualizar.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               thumbnails:
 *                 type: string
 *               code:
 *                 type: string
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 *       401:
 *         description: Usuario no autenticado.
 *       500:
 *         description: Error al actualizar el producto
 */

productsRoute.put('/:pid', currentMiddleware, async (req, res) => {
  try {
    const pid = req.params.pid;
    await productManager.updateProduct(pid, req.body);
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    return httpResponse.Ok(res, 'Producto actualizado correctamente');
  } catch (error) {
    logger.fatal({ msg: 'Error al actualizar el producto', error });
    return httpResponse.ServerError(res, 'Error al actualizar el producto');
  }
});

// Eliminar un producto por su ID
/**
 * @swagger
 * /api/products/{pid}:
 *   delete:
 *     tags:
 *     - Productos
 *     summary: Elimina un producto por su ID.
 *     description: Elimina un producto de la base de datos por su ID.
 *     parameters:
 *       - in: path
 *         name: pid
 *         description: ID del producto a eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente.
 *       401:
 *         description: Usuario no autenticado.
 *       500:
 *         description: Error al eliminar el producto
 */
productsRoute.delete('/:pid', currentMiddleware, async (req, res) => {
  try {
    const pid = req.params.pid;
    await productManager.deleteProduct(pid);
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    return httpResponse.Ok(res, 'Producto eliminado correctamente');
  } catch (error) {
    logger.fatal({ msg: 'Error al eliminar el producto', error })
    return httpResponse.ServerError(res, 'Error al eliminar el producto');
  }
});

export default productsRoute;
