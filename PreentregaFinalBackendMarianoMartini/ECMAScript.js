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
        console.log('Error: Product not found.');
        return ("not found")
      }
    }
  }
  
  const manager = new ProductManager();
  
  manager.addProduct('Producto 1', 'Descripción 1', 10, 'imagen1.jpg', 'CODE001', 20);
  manager.addProduct('Producto 1', 'Descripción 1', 10, 'imagen1.jpg', 'CODE001', 20);
  manager.addProduct('Producto 2', 'Descripción 2', 15, 'imagen2.jpg', 'CODE002', 10);
  manager.addProduct('Producto 3', 'Descripción 3', 20, 'imagen3.jpg', 'CODE003', 5);
  
  console.log(manager.getProducts());
  
  console.log(manager.getProductById(2));
  
  console.log(manager.getProductById(4));
  