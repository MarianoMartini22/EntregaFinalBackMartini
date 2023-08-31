import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const PRODUCTS_FILE_PATH = path.resolve( __dirname, '../../data/productos.json' );

class ProductController {
  constructor() {
    this.path = PRODUCTS_FILE_PATH;
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
      throw new Error(`Error al leer el archivo: ${error.message}`);
    }
  }

  saveProducts() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Error al guardar en el archivo: ${error.message}`);
    }
  }

  addProduct(product) {
    if (!product.title && !product.description && !product.price && !product.code && !product.stock && !product.category) {
      throw new Error('Error: Todos los campos son obligatorios.');
    }

    if (this.isCodeDuplicate(product.code)) {
      throw new Error(`Error: El código ya está en uso: ${product.code}`);
    }

    if (typeof product.status !== 'boolean') {
      product.status = true;
    }
    
    const newProduct = {
      id: this.nextId,
      title: product.title,
      description: product.description,
      price: product.price,
      thumbnails: product.thumbnails,
      code: product.code,
      stock: product.stock,
      category: product.category,
      status: product.status,
    };

    this.products.push(newProduct);
    this.nextId++;
    this.saveProducts();
  }

  isCodeDuplicate(code) {
    return this.products.some((product) => product.code === code);
  }

  getProducts(limit=Infinity) {
    if (limit && limit > 0) {
      return this.products.slice(0, limit);
    }
    return this.products;
  }

  getProductById(id) {
    const product = this.products.find((product) => product.id === +id);
    if (product) {
      return product;
    } else {
      throw new Error('Error: Producto no encontrado.');
    }
  }

  async updateProduct(id, updatedFields) {
    const index = this.products.findIndex((product) => product.id === +id);
    if (index !== -1) {
      const productToUpdate = this.products[index];
  
      for (const field in updatedFields) {
        if (productToUpdate.hasOwnProperty(field) && field.toLowerCase() !== 'id') {
          productToUpdate[field] = updatedFields[field];
        }
      }
  
      this.products[index] = productToUpdate;
      this.saveProducts();
    } else {
      throw new Error('Error: Producto no encontrado.');
    }
  }
  
  deleteProduct(id) {
    const index = this.products.findIndex((product) => product.id === +id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProducts();
    } else {
      throw new Error('Error: Producto no encontrado.');
    }
  }
}

export default ProductController;
