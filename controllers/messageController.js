import admin from "../db/connection.js"

const messageController = {
    getAllMessages: async (request,response) => {
        admin.firestore().collection("messages").get()
        .then((snapshot) => {
            console.log();
            const messages = snapshot.docs.map((doc) => ({
                ...doc.data(), messageId: doc.id
            }));
            console.log(messages);
            response.json(messages);
        })
    },
    getMessagesByUserId: async (request,response) => {
        admin.firestore().collection("messages")
        .where('senderId', '==', request.params.userId)
        .get().then((snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
                ...doc.data(), messageId: doc.id
            }));
            response.json(messages);
        })
    }
};

export default messageController;