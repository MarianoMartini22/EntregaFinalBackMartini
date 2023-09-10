import { messagesModel } from '../dao/models/messages.model.js';

class ChatServices {
    async saveMessage({ user, message, color }) {
        const result = await messagesModel.create({ user, message, color });
        return result;
    }

    async getMessages() {
        const messages = await messagesModel.find().lean();
        return messages;
    }
}

export default ChatServices;
