import express from 'express';
import CartManagerFS from '../controllers/fileSystem/controllers.carts.js';
import cartManagerMongo from '../controllers/mongoDB/controllers.carts.js';
import dotenv from 'dotenv';
import isAuth from '../middlewares/isAuth.js';

dotenv.config();

// import controllers.products from '../dao/fileSystem/controllers.products.js';
import { initializeLastCartId } from '../utils/helpers.js';
import config from '../utils/config.js';
import { HttpResponse } from '../utils/http.response.js';
import ProductController from '../controllers/mongoDB/controllers.products.js';
import TicketController from '../controllers/mongoDB/controllers.ticket.js';
import { logger } from '../utils/logger.js';
const httpResponse = new HttpResponse();

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

/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: Módulo de Carrito.
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
const productManager = new ProductController();

const ticketManager = new TicketController();

// cartRoute.use(isAuth);

/**
 * @swagger
 * /api/carts/{cid}:
 *   get:
 *     tags:
 *     - Carrito
 *     summary: Obtiene los productos de un carrito por su ID.
 *     parameters:
 *       - in: path
 *         name: cid
 *         description: ID del carrito.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Muestra el carrito.
 *       404:
 *         description: No se encontró el carrito.
 */

cartRoute.get('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);
    const products = cart.products;

    return httpResponse.Ok(res, products);
  } catch (error) {
    logger.warning('No se encontró el carrito');
    return httpResponse.NotFound(res, 'No se encontró el carrito');
  }
});

initializeLastCartId();

/**
 * @swagger
 * /api/carts:
 *   post:
 *     tags:
 *     - Carrito
 *     summary: Crea un nuevo carrito.
 *     description: Crea un nuevo carrito para el usuario actual.
 *     responses:
 *       200:
 *         description: Carrito creado con éxito.
 *       500:
 *         description: Error al crear el carrito.
 */


cartRoute.post('/', async (req, res) => {
  try {
    const { user } = req.socketServer.user;
    const cart = await cartManager.getCartByUserId(user._id);
    if (cart) {
      logger.error('Error al agregar carrito, ya posee un carrito');
      return httpResponse.ServerError(res, 'Error al agregar carrito, ya posee un carrito');
    }
    if (!user._id) {
      logger.error('Error al agregar carrito, verifique su usuario');
      return httpResponse.ServerError(res, 'Error al agregar carrito, verifique su usuario');
    }
    cartManager.createCart(user.user._id);
    return httpResponse.Ok(res, { message: 'Carrito agragado con éxito.' });
  } catch (error) {
    logger.fatal({msg: 'Error al agregar carrito', error});
    return httpResponse.ServerError(res, 'Error al agregar carrito');
  }
});

/**
 * @swagger
 * /api/carts/{cid}/product/{pid}:
 *   post:
 *     tags:
 *     - Carrito
 *     summary: Agregar un producto al carrito.
 *     description: Agrega un producto al carrito especificado por su ID de carrito y el ID de producto.
 *     parameters:
 *       - in: path
 *         name: cid
 *         description: ID del carrito.
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         description: ID del producto a agregar al carrito.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto agregado al carrito correctamente.
 *       500:
 *         description: Error al agregar el producto al carrito.
 */


cartRoute.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const user = req.socketServer.user;
    const cart = await cartManager.addProductToCart(cId, pId, user.user._id);

    return httpResponse.Ok(res, { message: 'Producto agregado al carrito correctamente.', cart });

  } catch (error) {
    logger.error({msg: 'Error al agregar producto al carrito', error});
    return httpResponse.ServerError(res, 'Error al agregar producto al carrito');
  }
});

/**
 * @swagger
 * /api/carts/{cid}/products/{pid}:
 *   delete:
 *     tags:
 *     - Carrito
 *     summary: Eliminar un producto del carrito.
 *     description: Elimina un producto del carrito especificado por su ID de carrito y el ID de producto.
 *     parameters:
 *       - in: path
 *         name: cid
 *         description: ID del carrito.
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         description: ID del producto a eliminar del carrito.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Productos borrados del carrito correctamente.
 *       500:
 *         description: Error al borrar productos del carrito.
 */

cartRoute.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const cart = await cartManager.removeProductFromCart(cId, pId);
    return httpResponse.Ok(res, { message: 'Producto borrado del carrito correctamente.', cart });
  } catch (error) {
    logger.error({ msg: 'Error al borrar producto del carrito', error });
    return httpResponse.ServerError(res, 'Error al borrar producto del carrito');
  }
});

/**
 * @swagger
 * /api/carts/{cid}:
 *   delete:
 *     tags:
 *     - Carrito
 *     summary: Vaciar el carrito.
 *     description: Elimina todos los productos del carrito especificado por su ID de carrito.
 *     parameters:
 *       - in: path
 *         name: cid
 *         description: ID del carrito a vaciar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Productos borrados del carrito correctamente.
 *       500:
 *         description: Error al borrar productos del carrito
 */


cartRoute.delete('/:cid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const cart = await cartManager.removeAllProductsFromCart(cId);
    return httpResponse.Ok(res, { message: 'Productos borrados del carrito correctamente.', cart });
  } catch (error) {
    logger.fatal({msg: 'Error al borrar productos del carrito', error});
    return httpResponse.ServerError(res, 'Error al borrar productos del carrito');
  }
});

/**
 * @swagger
 * /api/carts/{cid}:
 *   put:
 *     tags:
 *     - Carrito
 *     summary: Actualizar contenido del carrito.
 *     description: Actualiza el contenido del carrito especificado por su ID de carrito.
 *     parameters:
 *       - in: path
 *         name: cid
 *         description: ID del carrito a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Nuevos productos para agregar al carrito.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: ID del producto a agregar.
 *                     quantity:
 *                       type: number
 *                       description: Cantidad del producto a agregar.
 *     responses:
 *       200:
 *         description: Productos actualizados en el carrito correctamente.
 *       500:
 *         description: Error al actualizar productos del carrito.
 */


cartRoute.put('/:cid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const products = req.body.products;
    const cart = await cartManager.updateCart(cId, products);
    return httpResponse.Ok(res, { message: 'Productos actualizados en el carrito correctamente.', cart });

  } catch (error) {
    logger.fatal({msg: 'Error al actualizar productos del carrito', error});
    return httpResponse.ServerError(res, 'Error al actualizar productos del carrito');
  }
});

/**
 * @swagger
 * /api/carts/{cid}/products/{pid}:
 *   put:
 *     tags:
 *     - Carrito
 *     summary: Actualizar cantidad de un producto en el carrito.
 *     description: Actualiza la cantidad de un producto en el carrito especificado por su ID de carrito y el ID de producto.
 *     parameters:
 *       - in: path
 *         name: cid
 *         description: ID del carrito a actualizar.
 *         schema:
 *           type: string
 *       - in: path
 *         name: pid
 *         description: ID del producto en el carrito a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Nueva cantidad del producto en el carrito.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: Nueva cantidad del producto en el carrito.
 *     responses:
 *       200:
 *         description: Productos actualizados en el carrito correctamente.
 *       500:
 *         description: Error al actualizar productos del carrito.
 */


cartRoute.put('/:cid/products/:pid', async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;
    const quantity = req.body.quantity;
    const cart = await cartManager.updateCartByQuantity(cId, pId, quantity);
    return httpResponse.Ok(res, { message: 'Productos actualizados en el carrito correctamente.', cart });

  } catch (error) {
    logger.fatal({msg: 'Error al actualizar productos del carrito', error});
    return httpResponse.ServerError(res, 'Error al actualizar productos del carrito');
  }
});

/**
 * @swagger
 * /api/carts/{cid}/purchase:
 *   post:
 *     tags:
 *     - Carrito
 *     summary: Comprar productos en el carrito.
 *     description: Compra los productos en el carrito especificado por su ID de carrito. Se verifica si hay suficiente stock para cada producto antes de comprarlos.
 *     parameters:
 *       - in: path
 *         name: cid
 *         description: ID del carrito a comprar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carrito comprado con éxito.
 *       500:
 *         description: Error al comprar el carrito.
 */


cartRoute.post('/:cid/purchase', async (req, res) => {
  try {
    const cId = req.params.cid;
    const cart = await cartManager.getCartById(cId);
    const { _id } = req.socketServer.user.user;
    cart.products.map(async (prod) => {
      if (prod.quantity > prod.product._doc.stock) {
        await cartManager.deleteProductFromCart(cId, prod.product._id);
      } else {
        await productManager.updateProduct(prod.product._id, {...prod.product._doc, stock: prod.product.stock - prod.quantity});
      }
    });
    await ticketManager.generateTicket(_id, cart);
    return httpResponse.Ok(res, { message: 'Carrito comprado con éxito.' });
  } catch (error) {
    logger.fatal({msg: 'Error al comprar el carrito', error});
    return httpResponse.ServerError(res, 'Error al comprar el carrito', error);
  }
});

export default cartRoute;
