import express from 'express';
import ProductManager from '../managers/ProductManager.js';

const viewsRoute = express.Router();
const productManager = new ProductManager();

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



viewsRoute.get('/producto-details/:pid', async (req, res) => {

});

export default viewsRoute;
