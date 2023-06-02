class ProductManager {
    constructor() {
      this.products = [];
      this.nextId = 1;
    }
  
    addProduct(title, description, price, thumbnail, code, stock) {
      if (!title || !description || !price || !thumbnail || !code || !stock) {
        console.log('Error: Todos los campos son obligatorios.');
        return;
      }
  
      if (this.isCodeDuplicate(code)) {
        console.log('Error: El código ya está en uso.');
        return;
      }
  
      const product = {
        id: this.nextId,
        title,
        description,
        price,
        thumbnail,
        code,
        stock
      };
  
      this.products.push(product);
      this.nextId++;
    }
  
    isCodeDuplicate(code) {
      return this.products.some(product => product.code === code);
    }
  
    getProducts() {
      return this.products;
    }
  
    getProductById(id) {
      const product = this.products.find(product => product.id === id);
      if (product) {
        return product;
      } else {
        console.log('Error: Producto no encontrado.');
      }
    }
  }

  const manager = new ProductManager();

  manager.addProduct('Producto 1', 'Descripción 1', 10, 'imagen1.jpg', 'CODE001', 20);
  manager.addProduct('Producto 2', 'Descripción 2', 15, 'imagen2.jpg', 'CODE002', 10);
  manager.addProduct('Producto 3', 'Descripción 3', 20, 'imagen3.jpg', 'CODE003', 5);
  
  console.log(manager.getProducts());
  // Output:
  // [
  //   { id: 1, title: 'Producto 1', description: 'Descripción 1', price: 10, thumbnail: 'imagen1.jpg', code: 'CODE001', stock: 20 },
  //   { id: 2, title: 'Producto 2', description: 'Descripción 2', price: 15, thumbnail: 'imagen2.jpg', code: 'CODE002', stock: 10 },
  //   { id: 3, title: 'Producto 3', description: 'Descripción 3', price: 20, thumbnail: 'imagen3.jpg', code: 'CODE003', stock: 5 }
  // ]
  
  console.log(manager.getProductById(2));
  // Output:
  // { id: 2, title: 'Producto 2', description: 'Descripción 2', price: 15, thumbnail: 'imagen2.jpg', code: 'CODE002', stock: 10 }
  
  console.log(manager.getProductById(4));
  // Output:
  // Error: Producto no encontrado.
  