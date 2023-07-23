import express from 'express';
import ProductManagerFS from '../dao/fileSystem/ProductManager.js';
import ProductManagerMongo from '../dao/mongoDB/ProductManager.js';
import CartManagerFS from '../dao/fileSystem/CartManager.js';
import CartManagerMongo from '../dao/mongoDB/CartManager.js';

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
let cartManager = null;

switch (process.env.DB) {
  case 'fs':
    cartManager = new CartManagerFS();
    break;
  case 'mongodb':
    cartManager = new CartManagerMongo();
    break;
  default:
    cartManager = new CartManagerMongo();
    break;
}

/*
**********************
Para alternar las base de datos se puede cambiar el .env (BD).
Posibles valores:
1- fs (filesystem)
2- mongodb
Por defecto será mongoDB
**********************
*/


const viewsRoute = express.Router();

viewsRoute.get('/productos', async (req, res) => {
  try {
    const baseURL = 'http://localhost:8080/api/products';
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sort = req.query.sort ? req.query.sort : 'asc';
    const filter = req.query.filter ? req.query.filter : null;
    const filterValue = req.query.filterValue ? req.query.filterValue : null;
    const products = await productManager.getProducts(limit, page, sort, filter, filterValue);
    req.socketServer.sockets.emit('actualizarProductos', products);
    const plainProducts = products.docs.map((product) => product.toObject({ virtuals: true }));
    const prevPageNumber = products.prevPage;
    const nextPageNumber = products.nextPage;

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
    res.render('home', {
      products: finalProducts.payload,
      currentPage: page,
      totalPages: finalProducts.totalPages,
      hasNextPage: finalProducts.hasNextPage,
      hasPrevPage: finalProducts.hasPrevPage,
      nextPage: finalProducts.nextPage,
      prevPage: finalProducts.prevPage,
      limit
    });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.', detailError: error.message });
  }
});

viewsRoute.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    req.socketServer.sockets.emit('actualizarProductos', products);
    res.render('realtimeproducts', {products});
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.', detailError: error.message });
  }
});

viewsRoute.get('/carts/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);
    if (!cart) res.status(404).json({ error: 'No hay un carrito con esa id.' });
    const products = cart.products.map((prod) => {
      return { product: prod.product.toJSON(), quantity: prod.quantity}
    });
    res.render('carrito', {products});
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.', detailError: error.message });
  }
});


viewsRoute.get('/chat', async (req, res) => {
  try {
    res.render('chat');
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener los chats.', detailError: error.message });
  }
});

viewsRoute.get('/producto-details/:pid', async (req, res) => {

});

export default viewsRoute;
