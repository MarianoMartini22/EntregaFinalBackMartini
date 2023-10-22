import chaiHttp from 'chai-http';
import app from '../server.js';
import chai from 'chai';
import CartsManager from '../controllers/mongoDB/controllers.carts.js';
const expect = chai.expect;
chai.use(chaiHttp);

describe('Pruebas sobre router carrito', () => {
    it('Debería obtener los productos de un carrito por su ID', (done) => {
        chai.request(app)
            .get('/api/carts/6516117c6211a246539543ed')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.data).to.be.an('array');
                done();
            });
    });

    it('Debería agregar un producto a un carrito', async () => {
        const cartsManager = new CartsManager();
        const productId = '64b5e301488abafc7e2b94d5';
        const cartId = '6516117c6211a246539543ed';
        const user = '64d7a7f9a43c0aa2a076d74b';

        const updatedCart = await cartsManager.addProductToCart(cartId, productId, user);
        const addedProduct = updatedCart.find((product) => product.product._id.toString() === productId.toString());
        expect(addedProduct).to.exist;
    });

    it('Debería eliminar un producto de un carrito', async () => {
        const cartsManager = new CartsManager();
        const productId = '64b5e301488abafc7e2b94d5';
        const cartId = '6516117c6211a246539543ed';

        await cartsManager.deleteProductFromCart(cartId, productId);
        const updatedCart = await cartsManager.getCartById(cartId);
        const removedProduct = updatedCart.products.find(product => product.product._id.toString() === productId.toString());
        expect(removedProduct).to.not.exist;
    });

});