import mongoose from "mongoose";

const collection = "users";

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    default: "usuario",
  },
  github: {
    type: Boolean,
    default: false,
  }
});

export const userModel = mongoose.model(collection, UserSchema);
