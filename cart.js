import fs from 'fs';

app.get('/api/carts/:cid', (req, res) => {
    try {
        const cid = req.params.cid;
        // Aquí debes cargar los datos del carrito con el ID cid desde el archivo correspondiente

        // Verificar si el carrito existe
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }

        // Obtener los productos del carrito
        const products = cart.products;

        // Responder con los productos del carrito
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Ocurrió un error al obtener los productos del carrito.' });
    }
});

app.post('/api/carts/:cid/product/:pid', (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        // Aquí debes cargar los datos del carrito con el ID cid desde el archivo correspondiente

        // Verificar si el carrito existe
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }

        // Verificar si el producto ya existe en el carrito
        const existingProduct = cart.products.find((product) => product.id === pid);
        if (existingProduct) {
            // Si el producto ya existe, incrementar la cantidad
            existingProduct.quantity++;
        } else {
            // Si el producto no existe, agregarlo al carrito con cantidad inicial de 1
            cart.products.push({ id: pid, quantity: 1 });
        }

        // Guardar los cambios en el archivo del carrito

        // Responder con un mensaje de éxito
        res.json({ message: 'Producto agregado al carrito correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Ocurrió un error al agregar el producto al carrito.' });
    }
});

let cartData = [];

function loadCartData() {
  try {
    const data = fs.readFileSync('carrito.json', 'utf8');
    if (data) {
      cartData = JSON.parse(data);
    }
  } catch (error) {
    console.log('Error al leer el archivo del carrito:', error.message);
  }
}

// Llamar a la función loadCartData al iniciar el servidor
loadCartData();

function saveCartData() {
    try {
      fs.writeFileSync('carrito.json', JSON.stringify(cartData), 'utf8');
    } catch (error) {
      console.log('Error al guardar en el archivo del carrito:', error.message);
    }
  }
  
  // Ejemplo de uso: Guardar los cambios después de agregar un producto al carrito
  cartData.push({ id: pid, quantity: 1 });
  saveCartData();
  
  const fs = require('fs').promises;

// Ruta del archivo del carrito
const cartFilePath = 'carrito.json';

// Cargar datos del carrito
async function loadCartData() {
  try {
    const data = await fs.readFile(cartFilePath, 'utf8');
    if (data) {
      return JSON.parse(data);
    } else {
      return [];
    }
  } catch (error) {
    console.log('Error al leer el archivo del carrito:', error.message);
    return [];
  }
}

// Guardar datos del carrito
async function saveCartData(cartData) {
  try {
    await fs.writeFile(cartFilePath, JSON.stringify(cartData), 'utf8');
  } catch (error) {
    console.log('Error al guardar en el archivo del carrito:', error.message);
  }
}

// Obtener datos del carrito
async function getCartData() {
  try {
    const cartData = await loadCartData();
    return cartData;
  } catch (error) {
    console.log('Error al obtener los datos del carrito:', error.message);
    return [];
  }
}

// Agregar un producto al carrito
async function addToCart(productId) {
  try {
    let cartData = await loadCartData();
    cartData.push({ id: productId, quantity: 1 });
    await saveCartData(cartData);
  } catch (error) {
    console.log('Error al agregar un producto al carrito:', error.message);
  }
}

// Ejemplo de uso
async function test() {
  const cartData = await getCartData();
  console.log('Datos del carrito:', cartData);

  await addToCart(123);
  console.log('Producto agregado al carrito');

  const updatedCartData = await getCartData();
  console.log('Datos actualizados del carrito:', updatedCartData);
}

test();
