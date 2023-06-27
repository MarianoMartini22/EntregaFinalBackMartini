const fs = require('fs');


class CartManager {
  constructor(filePath) {
    this.path = filePath;
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
      console.log('Error al leer el archivo del carrito:', error.message);
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
      console.log('Error al guardar en el archivo del carrito:', error.message);
    }
  }
}

module.exports = CartManager
