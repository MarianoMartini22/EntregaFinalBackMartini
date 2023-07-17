

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const uri = process.env.MONGODB_URI;

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