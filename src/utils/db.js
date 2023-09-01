

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from './config.js';

dotenv.config();
const uri = config.MONGODB_URI;

const dbConnection = () => {
    mongoose.connect( uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } );

    const db = mongoose.connection;

    db.on( 'error', ( error ) => {
        console.error( 'Error al conectar MongoDB:', error );
    } );

    db.once( 'open', () => {
        console.log( 'Conectado a MongoDB' );
    } );
};

export default dbConnection;