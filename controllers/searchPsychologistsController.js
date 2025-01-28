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

          const normalizeString = (str) => {
            return str
              .normalize("NFD") 
              .replace(/[\u0300-\u036f]/g, ""); 
          };
    
          const filteredPsychologists = snapshot.docs
          .map(doc => doc.data())
          .filter(user => {
            const normalizedSearchTerm = normalizeString(searchTerm.toLowerCase());
            console.log('333: '+normalizedSearchTerm);
            return (
              normalizeString(user.name?.toLowerCase()).includes(normalizedSearchTerm) || 
              normalizeString(user.lastname?.toLowerCase()).includes(normalizedSearchTerm) || 
              user.bio?.toLowerCase().includes(normalizedSearchTerm) ||
              user.title?.toLowerCase().includes(normalizedSearchTerm)
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