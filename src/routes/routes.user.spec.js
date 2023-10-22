import chai from 'chai';
import chaiHttp from 'chai-http';
import UserController from '../controllers/mongoDB/controllers.user.js';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Prueba de inicio de sesión', () => {
  let userController;
  let testUser;

  before(async () => {
    userController = new UserController();
    testUser = {
      email: 'test99@test99.com',
      password: '1234',
    };
    await userController.saveUser(testUser);
  });

  it('Debería permitir que un usuario inicie sesión con credenciales válidas', async () => {
    const credentials = {
      email: testUser.email,
      password: testUser.password,
    };

    const result = await userController.loginUser(credentials);
    expect(result.ok).to.be.equal(true);
    expect(result.user).to.exist;
  });

  it('Debería rechazar un inicio de sesión con credenciales incorrectas', async () => {
    const credentials = {
      email: testUser.email,
      password: 'sarasa',
    };

    const result = await userController.loginUser(credentials);
    expect(result).to.be.an('object');
    expect(result.user).to.not.exist;
  });
});
