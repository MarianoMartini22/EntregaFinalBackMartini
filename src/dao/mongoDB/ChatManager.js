

import { messagesModel } from '../mongodb/models/messages.model.js';

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class ChatManager {
    async saveMessage({ user, message }) {
        const existingMessage = await messagesModel.findOne({ user }).lean();
      
        let color;
        if (existingMessage) {
          color = existingMessage.color;
        } else {
          color = getRandomColor();
        }
      
        const result = await messagesModel.create({ user, message, color });
        return result;
      }
      
    async getMessages () {

        const result = await messagesModel.find().lean();
        return result;

    };
};


export default ChatManager;