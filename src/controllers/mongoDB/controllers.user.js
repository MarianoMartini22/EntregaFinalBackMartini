import UserService from '../../services/services.user.js';

class UserDTO {
    constructor(nombre, apellido, email, rol, github) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.rol = rol;
        this.github = github;
    }
}

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async saveUser({ nombre, apellido, email, password, github }) {
        const result = await this.userService.createUser({ nombre, apellido, email, password, github });
        return result;
    }

    async loginUser({ email, password }) {
        const result = await this.userService.loginUser({ email, password });
        return result;
    }

    async getUserById(id) {
        const result = await this.userService.getUserById(id);
        if (!result) return null;
        return new UserDTO(result.nombre, result.apellido, result.email, result.rol);
    }
}

export default UserController;
