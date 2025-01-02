import admin from "../db/connection.js"

const searchPsychologistsController = {
   
    searchPsychologists: async (request, response) => {
        const searchTerm = request.query.q;
        try {
          const usersRef = admin.firestore().collection("Users");
          const snapshot = await usersRef
            .where(
                "professionalType", "==", true
            ) 
            .get();
    
          if (snapshot.empty) {
            return response.status(404).json({ message: "Nenhum resultado encontrado." });
          }
    
          const filteredPsychologists = snapshot.docs
          .map(doc => doc.data())
          .filter(user => {
            const searchLower = searchTerm.toLowerCase();
            return (
              user.name?.toLowerCase().includes(searchLower) || 
              user.lastname?.toLowerCase().includes(searchLower) || 
              user.bio?.toLowerCase().includes(searchLower) ||
              user.title?.toLowerCase().includes(searchLower)
            );
          });
  
        return response.json(filteredPsychologists);
        } catch (error) {
          console.error("Error : ", error);
          return response.status(500).json({ message: "Error ", error });
        }
      }

};
export default searchPsychologistsController;