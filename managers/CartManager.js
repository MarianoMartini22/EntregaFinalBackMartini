import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const CART_FILE_PATH = path.resolve( __dirname, '../data/carrito.json' );
class CartManager {
  constructor() {
    this.path = CART_FILE_PATH;
    this.carts = [];
    this.nextId = 1;
  }

  loadCartData(cid) {
    try {
      let data = fs.readFileSync(this.path, 'utf8');
      if (data) {
        data = JSON.parse(data);
        if (cid) return data.find((cart) => cart.id === cid);
        return data;
      }
      return [];
    } catch (error) {
      throw new Error('Error al leer el archivo del carrito: ' + error.message);
    }
  }

  saveCartData(cart, cId) {
    try {
      let carts = this.loadCartData();

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
