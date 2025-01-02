import admin from "../db/connection.js"

const availabilityController = {
    getAllAvailabilitys: async (request,response) => {
        admin.firestore().collection("Availability").get()
        .then((snapshot) => {
            console.log();
            const availabilitys = snapshot.docs.map((doc) => ({
                ...doc.data(), availabilityId: doc.id
            }));
            console.log(availabilitys);
            response.json(availabilitys);
        })
    },
    getAvailabilitysByUserId: async (request,response) => {
        admin.firestore().collection("Availability")
        .where('professionalId', '==', request.params.id)
        .get().then((snapshot) => {
            const availabilitys = snapshot.docs.map((doc) => ({
                ...doc.data(), availabilityId: doc.id
            }));
            response.json(availabilitys);
        })
    },
    createAvailability:  async (request, response) => {
        console.log("Create availability");
        console.log(request.body);
        const availability = {
            professionalId: request.body.professionalId,
            dayOfWeek: request.body.dayOfWeek,
            startTime: request.body.startTime,
            endTime: request.body.endTime,

        };
    
        try {
            const docRef = await admin.firestore().collection("Availability").add(availability);
    
            response.json({
            status: "Availabilitys criado com sucesso!",
            userId: docRef.id,
            });
        } catch (error) {
            response.json({ status: "Erro ao criar availability", message: error.message });
        }
    }
};

export default availabilityController;