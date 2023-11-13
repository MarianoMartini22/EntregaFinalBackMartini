import UserService from '../../services/services.user.js';

class UserDTO {
    constructor(nombre, apellido, email, rol, github, token, password, _id) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.rol = rol;
        this.github = github;
        this.token = token;
        this.password = password;
        this._id = _id;
    }
}

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async saveUser({ nombre, apellido, email, password, github, token }) {
        const result = await this.userService.createUser({ nombre, apellido, email, password, github, token });
        return result;
    }

    async updateUser({ nombre, apellido, email, rol, password, github, token }) {
        const result = await this.userService.updateUser({ nombre, apellido, email, rol, password, github, token });
        return result;
    }

    async loginUser({ email, password }) {
        const result = await this.userService.loginUser({ email, password });
        return result;
    }

    async getUserById(id) {
        const result = await this.userService.getUserById(id);
        if (!result) return null;
        return new UserDTO(result.nombre, result.apellido, result.email, result.rol, result.github, result.token);
    }

    async getUserByEmail(email) {
        const result = await this.userService.getUserByEmail(email);
        if (!result) return null;
        return new UserDTO(result.nombre, result.apellido, result.email, result.rol, result.github, result.token);
    }
    async getUserByEmailPassword(email) {
        const result = await this.userService.getUserByEmail(email);
        if (!result) return null;
        return new UserDTO(result.nombre, result.apellido, result.email, result.rol, result.github, result.token, result.password);
    }
    async getUserByEmailFull(email) {
        const result = await this.userService.getUserByEmail(email);
        if (!result) return null;
        return new UserDTO(result.nombre, result.apellido, result.email, result.rol, result.github, result.token, result.password, result._id);
    }
    async getUsers(full = false) {
        const result = await this.userService.getUsers();
        if (!result) return null;
        let users = [];
        if (!full) {
            users = result.map((result) => {
                return new UserDTO(result.nombre, result.apellido, result.email, result.rol);
            });
            return users;
        }
        users = result.map((result) => {
            return new UserDTO(result.nombre, result.apellido, result.email, result.rol, result.github, result.token, result.password);
        });
        return users;
    }
    async deleteUsers(users) {
        const deletedUsers = await this.userService.deleteUsers(users);
        return deletedUsers;
    }
}

export default UserController;
