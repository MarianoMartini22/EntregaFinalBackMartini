import express from 'express';
import ProductManager from './ProductManager.js';

const app = express();
const port = 8080;

app.use(express.json());

const filePath = './productos.json';
const productManager = new ProductManager(filePath);

// Manejo de rutas para productos
const productsRouter = express.Router();

// Listar todos los productos
productsRouter.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos.' });
  }
});

// Obtener un producto por su ID
productsRouter.get('/:pid', async (req, res) => {
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

// Agregar un nuevo producto
productsRouter.post('/', (req, res) => {
  try {
    productManager.addProduct(req.body);
    res.status(201).json({ message: 'Producto agregado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar el producto.' });
  }
});

// Actualizar un producto por su ID
productsRouter.put('/:pid', (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    productManager.updateProduct(pid, req.body);
    res.json({ message: 'Producto actualizado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el producto.' });
  }
});

// Eliminar un producto por su ID
productsRouter.delete('/:pid', (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    productManager.deleteProduct(pid);
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar el producto.' });
  }
});

app.use('/api/products', productsRouter);

// Manejo de rutas para carritos
const cartsRouter = express.Router();

// Crear un nuevo carrito
cartsRouter.post('/', (req, res) => {
  try {
    // Crear un nuevo carrito con un ID autogenerado
    const cartId = generateCartId();
    const newCart = { id: cartId, products: [] };
    // Guardar el carrito en el archivo
    saveCart(newCart);
    res.status(201).json({ message: 'Carrito creado correctamente.', cartId });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el carrito.' });
  }
});

// Obtener los productos de un carrito por su ID
cartsRouter.get('/:cid', (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = loadCart(cid);
    if (cart) {
      res.json(cart.products);
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener el carrito.' });
  }
});

// Agregar un producto a un carrito por su ID
cartsRouter.post('/:cid/product/:pid', (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = parseInt(req.params.pid);
    const cart = loadCart(cid);
    if (cart) {
      const existingProduct = cart.products.find((product) => product.id === pid);
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.products.push({ id: pid, quantity: 1 });
      }
      saveCart(cart);
      res.json({ message: 'Producto agregado al carrito correctamente.' });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar el producto al carrito.' });
  }
});

app.use('/api/carts', cartsRouter);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Funciones auxiliares

function generateCartId() {
  // Generar un ID único para el carrito
  return Date.now().toString(36);
}

function loadCart(cartId) {
  try {
    const data = fs.readFileSync(`./cart_${cartId}.json`, 'utf8');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error al leer el carrito:', error.message);
  }
  return null;
}

function saveCart(cart) {
  try {
    fs.writeFileSync(`./cart_${cart.id}.json`, JSON.stringify(cart), 'utf8');
  } catch (error) {
    console.log('Error al guardar el carrito:', error.message);
  }
}
