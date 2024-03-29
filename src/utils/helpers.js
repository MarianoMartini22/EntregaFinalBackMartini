import fs from 'fs';
import __dirname from './utils.js';
import path from 'path';
import { logger } from './logger.js';

let lastCartId = 0;

function readLastCartId() {
    try {
      const data = fs.readFileSync(path.join(__dirname, './data/lastCartId.json'), 'utf8');
      if (!data) return 0;
      return JSON.parse(data).lastCartId;
    } catch (error) {
      console.log('Error al leer el último ID del carrito:', error.message);
      return 0;
    }
}
  
function writeLastCartId(id) {
    try {
        const jsonData = {
        lastCartId: id
        };
        const jsonString = JSON.stringify(jsonData, null, 2);
        fs.writeFileSync('./data/lastCartId.json', jsonString, 'utf8');
        logger.info('Último ID del carrito guardado exitosamente.');
    } catch (error) {
        console.log('Error al guardar el último ID del carrito:', error.message);
    }
}

function generateNewCartId() {
    lastCartId++;
    writeLastCartId(lastCartId);
    return lastCartId.toString();
}

function initializeLastCartId() {
    lastCartId = readLastCartId();
}

export {
    generateNewCartId,
    initializeLastCartId,
}