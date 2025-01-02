import admin from "../db/connection.js";

const usersConnectionController = {
  getAllUsersConnections: async (request, response) => {
    console.log("Get All UserConnections");

    admin
      .firestore()
      .collection("UsersConnections")
      .get()
      .then((snapshot) => {
        const usersConnectinons = snapshot.docs.map((doc) => ({
          ...doc.data(),
          uid: doc.id,
        }));
        response.json(usersConnectinons);
      });
  },

  getUsersConnectionsById: async (request, response) => {
    console.log("Get UsersConnections by Id");
    const { id, userType } = request.params;
    

    try {
        admin
      .firestore()
      .collection("UsersConnections")
      .get()
      .then((snapshot) => {
        const usersConnectinons = snapshot.docs.map((doc) => ({
          ...doc.data(),
          uid: doc.id,
        }));

        const connectionsValues = usersConnectinons.values();

        let conectionById = [];

        Array.from(connectionsValues).forEach(connection => {
            console.log("CONEXÃO: "+connection.patientId);
            if( userType === "patient" && connection.patientId === id){
                conectionById.push(connection); 
            }else if(userType === "professional" && connection.professionalId === id)
            {
                conectionById.push(connection);
            }
                 
        });
        response.json(conectionById);   
        });
        

    } catch (error) {
        console.error("Error getting users connections by ID:", error);
        response.status(500).json({ status: "Error", message: error.message });
    }
  },

  createUserConnection: async (request, response) => {
    console.log("Create UsersConnections");
    const user = {
      patientId: request.body.PatientId,
      professionalId: request.body.ProfessionalId,
      connectionDate: request.body.ConnectionDate   
    };

    try {
      const docRef = await admin.firestore().collection("UsersConnections").add(user);

      response.json({
        status: " Registro de UsersConnections criado com sucesso!",
        userConnectionId: docRef.id,
      });
    } catch (error) {
      response.json({ status: "Erro ao criar um registro de UsersConnections", message: error });
    }
  },
};

export default usersConnectionController;
