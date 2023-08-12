import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateNewCartId } from '../../helpers.js';
import ProductManager from '../fileSystem/ProductManager.js';
const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const CART_FILE_PATH = path.resolve( __dirname, '../../data/carrito.json' );

const productManager = new ProductManager();

class CartManager {
  constructor() {
    this.path = CART_FILE_PATH;
    this.carts = [];
    this.nextId = 1;
  }

  getCartById(cid) {
    try {
      let cart = {}
      let data = fs.readFileSync(this.path, 'utf8');
      if (!data) {
        throw new Error('No hay carritos cargados');
      }
      if (data) {
        data = JSON.parse(data);
        if (cid) cart = data.find((cart) => cart.id === cid);
        if (!cart) throw new Error('Carrito no encontrado.');
        return cart;
      }
      return [];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  getCarts() {
    try {
      let data = fs.readFileSync(this.path, 'utf8');
      if (!data) {
        throw new Error('No hay carritos cargados');
      }
      if (data) {
        data = JSON.parse(data);
        return data;
      }
      return [];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      let carts = this.getCarts();
      const product = await productManager.getProductById(productId);

      const cart = await this.getCartById(cartId);
      const existingProduct = cart.products.find(
      (item) => item.product.id.toString() === product.id.toString()
      );
      if (existingProduct) {
        // Si el producto ya está en el carrito, se incrementa la cantidad
        existingProduct.quantity += 1;
      } else {
        // Si el producto no está en el carrito, se agrega con una cantidad de 1
        cart.products.push({ product, quantity: 1 });
      }
      const existingCartIndex = carts.findIndex(c => c.id === cId);
      if (existingCartIndex !== -1) {
        carts[existingCartIndex].products = cart.products;
      } else {
        carts.push(cart);
      }

      fs.writeFileSync(this.path, JSON.stringify(carts, null, 2), 'utf8');
    } catch (error) {
      throw new Error('Error al guardar en el archivo del carrito: ' + error.message);
    }
    
  };

  createCart(cart) {
    try {
      const cId = generateNewCartId();
      if (!cart) cart = {
        id: cId,
        products: [],
      };
      let carts = this.getCarts();

      const existingCartIndex = carts.findIndex(c => c.id === cId);
      if (existingCartIndex !== -1) {
        carts[existingCartIndex].products = cart.products;
      } else {
        carts.push(cart);
      }

      fs.writeFileSync(this.path, JSON.stringify(carts, null, 2), 'utf8');
      console.log('Archivo del carrito guardado exitosamente.');
    } catch (error) {
      throw new Error('Error al guardar en el archivo del carrito: ' + error.message);
    }
  }
}

export default CartManager;
