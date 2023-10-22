import chaiHttp from 'chai-http';
import app from '../server.js';
import chai from 'chai';
const expect = chai.expect;
chai.use(chaiHttp);

describe('Pruebas sobre router productos', () => {

  it('Debería obtener la lista de productos', (done) => {
    chai.request(app)
      .get('/api/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.status).to.equal('success');
        expect(res.body.data.payload).to.be.an('array');
        expect(res.body.data.payload).to.not.be.empty;
        done();
      });
  });

  it('Debería obtener un producto por su ID', (done) => {
    const productId = '64b5e301488abafc7e2b94d5';
    const mockProduct = {
        "_id": "64b5e301488abafc7e2b94d5",
        "title": "tests",
        "description": "test descripcion",
        "price": 500,
        "thumbnails": "imgs.png",
        "code": "ABCCODES111a1",
        "stock": 9974,
        "category": "categorias",
        "status": true,
        "__v": 0
    }
    chai.request(app)
      .get(`/api/products/${productId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal('success');
        expect(res.body.data).to.be.an('object');
        expect(res.body.data.code).to.be.equal(mockProduct.code);
        done();
      });
  });

  it('Debería agregar un nuevo producto', (done) => {
    const newProduct = {
      title: 'Ejemplo de Producto',
      description: 'Descripción de ejemplo',
      price: 9.99,
      thumbnails: 'url_de_la_imagen',
      code: 'cambiar_este_codigo',
      stock: 10,
      category: 'Categoría_de_ejemplo',
      status: true
    };
  
    chai.request(app)
      .post('/api/products')
      .send(newProduct)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  
});
