import express from 'express';
import ProductManagerFS from '../dao/mongoDB/ProductManager.js';
import ProductManagerMongo from '../dao/fileSystem/ProductManager.js';
import ChatManager from '../dao/mongoDB/ChatManager.js';

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
const chatManager = new ChatManager();

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
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const products = await productManager.getProducts(limit);
    res.render('home', { products });
    // res.json(products);
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
