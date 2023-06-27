const express = require('express');
const app = express();
const PORT = 8080;
 
const router = express.Router();
const productsRoute = require('./routes/ProductsRoute.js');
const cartRoute = require('./routes/CartsRoute.js');
 
app.use(express.json());
app.use(router);
app.use('/api/products', productsRoute);
app.use('/api/carts', cartRoute);

app.get('/', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'La api funciona',
  });
});
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
