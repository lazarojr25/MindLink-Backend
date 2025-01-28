import admin from "../db/connection.js";

const userController = {

  getAllUsers: async (request, response) => {
    console.log("Get All User");

    admin
      .firestore()
      .collection("Users")
      .get()
      .then((snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          ...doc.data(),
          uid: doc.id,
        }));
        response.json(users);
      });
  },

  //gets all professional users
  getProfessionalUser: async (request,response) =>
    {
      try
      {
        admin.firestore().collection("Users").where("professionalType","==", true).get()
        .then((snapshot) =>{
          const users = snapshot.docs.map((doc) => ({
            ...doc.data(),
            uid: doc.id,  
          }));
          response.json(users);
        }); 
      }catch (error){
          response.status(500).json({error: "Erro ao pegar usuários do tipo profissional"});
      }  
    },

  checkIfUserIsProfessional: async (request, response) => {
      try {
        console.log("Checking if user is professional");
        const userRef = await admin
          .firestore()
          .collection("Users")
          .doc(request.params.id)
          .get();
          
    
        if (!userRef.exists) {
          return response.status(404).json({ message: "User not found" });
        }
    
        const userData = userRef.data();
        const isProfessional = !!userData.professionalType; // Converte o valor para booleano
        return response.json({ isProfessional });
      } catch (error) {
        console.error("Error checking professional type:", error);
        return response.status(500).json({ message: "Internal server error" });
      }
  },  

  getUserById: async (request, response) => {
    console.log("Get User by Id");
    console.log(request.params);
    const userSelected = await admin
      .firestore()
      .collection("Users")
      .doc(request.params.id)
      .get();
    console.log(userSelected);
    response.json(userSelected.data());
  },

  createUser: async (request, response) => {
    console.log("Create User");
    const user = {
      email: request.body.email,
      name: request.body.name,
      password: request.body.password,
      professionalType: request.body.professionalType,
      photoURL: request.body.photoURL,
    };

    try {
      const docRef = await admin.firestore().collection("Users").add(user);

      response.json({
        status: "Usuário criado com sucesso!",
        userId: docRef.id,
      });
    } catch (error) {
      response.json({ status: "Erro ao criar usuário", message: error });
    }
  },

  updateUser: async (request, response) => {
    try {
      console.log("Updating User:", request.params.id);
  
      const userRef = admin.firestore().collection("Users").doc(request.params.id);

      const doc = await userRef.get();
      if (!doc.exists) {
        return response.status(404).json({ message: "Usuário não encontrado" });
      }

      const updates = request.body;
      await userRef.update(updates);
  
      const updatedDoc = await userRef.get();
      return response.json({
        message: "Usuário atualizado com sucesso",
        data: updatedDoc.data(),
      });
    } catch (error) {
      console.error("Erro ao atualizar o usuário:", error);
      return response.status(500).json({ message: "Erro interno no servidor", error });
    }
  },
  
};

export default userController;
