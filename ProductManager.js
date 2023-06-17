import fs from 'fs';


class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.nextId = 1;
    this.loadProducts();
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.path, 'utf8');
      if (data) {
        this.products = JSON.parse(data);
        const lastProduct = this.products[this.products.length - 1];
        this.nextId = lastProduct ? lastProduct.id + 1 : 1;
      }
    } catch (error) {
      console.log('Error al leer el archivo:', error.message);
    }
  }

  saveProducts() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.products), 'utf8');
    } catch (error) {
      console.log('Error al guardar en el archivo:', error.message);
    }
  }

  addProduct(product) {
    if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
      console.log('Error: Todos los campos son obligatorios.');
      return;
    }

    if (this.isCodeDuplicate(product.code)) {
      console.log('Error: El código ya está en uso.', product.code);
      return;
    }

    const newProduct = {
      id: this.nextId,
      title: product.title,
      description: product.description,
      price: product.price,
      thumbnail: product.thumbnail,
      code: product.code,
      stock: product.stock,
    };

    this.products.push(newProduct);
    this.nextId++;
    this.saveProducts();
  }

  isCodeDuplicate(code) {
    return this.products.some((product) => product.code === code);
  }

  getProducts(limit) {
    if (limit && limit > 0) return this.products.slice(0, limit);
    return this.products;
  }

  getProductById(id) {
    const product = this.products.find((product) => product.id === id);
    if (product) {
      return product;
    } else {
      console.log('Error: Producto no encontrado.');
      return null;
    }
  }

  updateProduct(id, updatedFields) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      const updatedProduct = { ...this.products[index], ...updatedFields, id: this.products[index].id };
      this.products[index] = updatedProduct;
      this.saveProducts();
    } else {
      console.log('Error: Producto no encontrado.');
    }
  }
  

  deleteProduct(id) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProducts();
    } else {
      console.log('Error: Producto no encontrado.');
    }
  }
}

export default ProductManager

// console.log(manager.getProducts());

// console.log(manager.getProductById(2));

// console.log(manager.getProductById(4));

// // Actualizar un producto
// manager.updateProduct(2, { price: 12, stock: 15 });

// // Eliminar un producto
// manager.deleteProduct(4);

// console.log(manager.getProducts());

