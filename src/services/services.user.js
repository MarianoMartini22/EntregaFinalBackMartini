import { userModel } from '../dao/models/usuario.model.js';
import bcrypt from 'bcrypt';

class UserService {
    async createUser({ nombre, apellido, email, password, github }) {
        try {
            const existingUser = await userModel.findOne({ email }).lean();
            if (existingUser && !github) {
                return { ok: false, error: 'Ya existe un usuario con el mail: ' + email };
            }

            let newUser = {};
            if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') newUser = { rol: 'admin' };
            if (!github) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                newUser = {
                    ...newUser,
                    nombre,
                    apellido,
                    email,
                    password: hashedPassword,
                };
            } else {
                newUser = {
                    ...newUser,
                    nombre,
                    apellido,
                    email,
                    password,
                    github: true,
                };
            }
            const result = await userModel.create(newUser);
            return { ok: true, user: result };
        } catch (error) {
            // Manejo de errores
            return { ok: false, error: 'Error al registrar el usuario: ' + error.message };
        }
    }

    async loginUser({ email, password }) {
        try {
            const existingUser = await userModel.findOne({ email }).lean();
            if (!existingUser) {
                return { ok: false, error: 'No hay un usuario con ese email...' };
            }

            const passwordMatch = await bcrypt.compare(password, existingUser.password);

            if (!passwordMatch) {
                return { ok: false, error: 'Datos incorrectos, revise y vuelva a intentarlo...' };
            }
            return { ok: true, user: existingUser };
        } catch (error) {
            return { ok: false, error: 'Ocurrió un error al intentar iniciar sesión.' };
        }
    }

    async getUserById(id) {
        if (!id) return null;
        const existingUser = await userModel.findOne({ _id: id }).lean();
        return existingUser;
    }
}

export default UserService;
