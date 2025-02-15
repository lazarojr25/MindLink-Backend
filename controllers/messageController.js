import admin from "../db/connection.js"

const messageController = {
    createMessage: async (request, response) => {
        try {
            request.body.createdAt = admin.firestore.FieldValue.serverTimestamp();
            const message = request.body;

            const docRef = await admin.firestore().collection("messages").add(message);
            response.json({ message: "Mensagem criada com sucesso", messageId: docRef.id });
        } catch (error) {
            response.status(500).json({ error: "Erro ao criar mensagem", details: error.message });
        }
    },

    getAllMessages: async (request, response) => {
        try {
            const snapshot = await admin.firestore().collection("messages").get();

            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    messageId: doc.id,
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
                };
            });

            response.json(messages);
        } catch (error) {
            response.status(500).json({ error: "Erro ao buscar mensagens", details: error.message });
        }
    },

    getMessagesByUserId: async (request, response) => {
        try {
            const snapshot = await admin.firestore().collection("messages")
                .where("participants", "array-contains", request.params.userId)
                .where("participants", "array-contains", contactId)
                .orderBy("createdAt", "desc")
                .get();

            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    messageId: doc.id,
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
                };
            });

            response.json(messages);
        } catch (error) {
            response.status(500).json({ error: "Erro ao buscar mensagens do usuário", details: error.message });
        }
    },

    getLastMessagesByUser: async (request, response) => {
        try {
            const userId = request.params.userId;

            //Buscar todas as mensagens do usuário
            const snapshot = await admin.firestore()
                .collection("messages")
                .where("participants", "array-contains", userId) 
                .orderBy("createdAt", "desc") 
                .get();

            if (snapshot.empty) {
                return response.json({ message: "Nenhuma conversa encontrada." });
            }

            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    messageId: doc.id,
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
                };
            });

            // Agrupar mensagens por contato (contactUserId), mantendo apenas a última mensagem
            const lastMessages = {};

            messages.forEach(message => {
                const contactUserId = message.senderId === userId ? message.receiverId : message.senderId;

                if (!lastMessages[contactUserId]) {
                    lastMessages[contactUserId] = {
                        contactUserId   ,
                        lastMessage: message.text,
                        createdAt: message.createdAt,
                        contactName: "" // Preencheremos depois com a busca no Firestore
                    };
                }
            });

            // **3️⃣ Buscar os nomes dos contatos na coleção "Users"**
            const userIds = Object.keys(lastMessages);
            if (userIds.length > 0) {
                const usersSnapshot = await admin.firestore()
                    .collection("Users")
                    .where(admin.firestore.FieldPath.documentId(), "in", userIds)
                    .get();

                usersSnapshot.docs.forEach(doc => {
                    const userId = doc.id;
                    const userName = doc.data().name +" "+doc.data().last_name || "Usuário Desconhecido";
                    if (lastMessages[userId]) {
                        lastMessages[userId].contactName = userName;
                    }
                });
            }

            // **4️⃣ Retornar o JSON estruturado**
            response.json(lastMessages);
        } catch (error) {
            response.status(500).json({ error: "Erro ao buscar últimas mensagens das conversas", details: error.message });
        }
    },

    getUserConversations: async (request, response) => {
            try {
                const { userId, contactId } = request.params;

                const snapshot = await admin.firestore()
                    .collection("messages")
                    .where("participants", "array-contains", userId)
                    .get();

                const filteredMessages = snapshot.docs.filter(doc => {
                    const data = doc.data();
                    return data.participants.includes(contactId);
                });

                if (filteredMessages.length === 0) {
                    return response.json({ message: "Nenhuma conversa encontrada." });
                }

                const messages = filteredMessages.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        messageId: doc.id,
                        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
                    };
                });

                // Agrupar mensagens por contato
                const conversations = {};
                const uniqueContacts = new Set();

                messages.forEach(message => {
                    const contactUserId = message.senderId === userId ? message.receiverId : message.senderId;

                    if (!conversations[contactUserId]) {
                        conversations[contactUserId] = [];
                    }
                    conversations[contactUserId].push(message);
                    uniqueContacts.add(contactUserId);
                });

                // Buscar nomes dos contatos na coleção "Users"
                const contactIds = Array.from(uniqueContacts);
                const usersSnapshot = await admin.firestore()
                    .collection("Users")
                    .where(admin.firestore.FieldPath.documentId(), "in", contactIds)
                    .get();

                const usersMap = {};
                usersSnapshot.docs.forEach(doc => {
                    usersMap[doc.id] = doc.data().name + " " + doc.data().last_name;
                });

                // Adiciona os nomes dos contatos nas conversas
                const conversationsWithNames = Object.entries(conversations).map(([contactId, messages]) => ({
                    contactId,
                    contactName: usersMap[contactId] || "Desconhecido", // Se não encontrar o nome, usa "Desconhecido"
                    messages
                }));

                response.json(conversationsWithNames);
            } catch (error) {
                response.status(500).json({ error: "Erro ao buscar conversas do usuário", details: error.message });
            }
        }
    };

export default messageController;