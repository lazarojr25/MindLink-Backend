import admin from "../db/connection.js";
import week from "../utils/Start-End-ofWeek.js";

const appointmentController = {
  getAllAppointments: async (request, response) => {
    console.log("Get All Appointments");

    admin
      .firestore()
      .collection("Appointments")
      .get()
      .then((snapshot) => {
        const appointments = snapshot.docs.map((doc) => ({
          ...doc.data(),
          uid: doc.id,
        }));
        response.json(appointments);
      });
  },

  getAppointmentById: async (request, response) => {
    console.log("Get Appointment by Id");
    console.log(request.params);
    const appointmentSelected = await admin
      .firestore()
      .collection("Appointments")
      .doc(request.params.id)
      .get();
    console.log(appointmentSelected);
    response.json(appointmentSelected.data());
  },

  getAppointmentsByProfessionalIdInCurrentWeek: async (request, response) => {
    console.log("Get Appointments by Professional Id in current week");
    console.log(request.params);
  
    try {
      const appointmentsRef = admin.firestore().collection("Appointments");
      console.log("week start " +week.start +" week end "+  week.end);
      
      const snapshot = await appointmentsRef
        .where("professionalId", "==", request.params.professionalId)
        .where("appointmentDate.year", "==", week.today.getFullYear()) // Same year
        .where("appointmentDate.month", "==", week.today.getMonth() + 1) // Same month (Firestore months are 1-based)
        .where("appointmentDate.day", ">=", week.start.getDate()) // Greater or equal to start of the week
        .where("appointmentDate.day", "<=", week.end.getDate()) // Less or equal to end of the week
        .get();
  
      if (snapshot.empty) {
        return response.status(404).json({ message: "No appointments found for this professional in the current week" });
      }
  
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(appointments);
      
      response.json(appointments);
    } catch (error) {
      console.error("Error getting appointments: ", error);
      response.status(500).json({ message: "Error getting appointments" });
    }
  },

  getAppointmentsByProfessionalIdInCurrentMonth: async (request, response) => {
    console.log("Get Appointments by Professional Id in current month");
    console.log(request.params);
  
    try {
      const appointmentsRef = admin.firestore().collection("Appointments");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // Mês em Firestore é baseado em 1 (janeiro = 1)
      
      console.log(`Current Year: ${currentYear}, Current Month: ${currentMonth}`);
      
      const snapshot = await appointmentsRef
        .where("professionalId", "==", request.params.professionalId)
        .where("appointmentDate.year", "==", currentYear) // Mesmo ano
        .where("appointmentDate.month", "==", currentMonth) // Mesmo mês
        .get();
  
      if (snapshot.empty) {
        return response.status(404).json({ message: "No appointments found for this professional in the current month" });
      }
  
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({ appointmentId: doc.id, ...doc.data() });
      });
      
      console.log(appointments);
      
      response.json(appointments);
    } catch (error) {
      console.error("Error getting appointments: ", error);
      response.status(500).json({ message: "Error getting appointments" });
    }  
  },

  getAppointmentsByPatientIdInCurrentMonth: async (request, response) => {
    console.log("Get Appointments by Patient Id in current month");
    console.log(request.params);
  
    try {
      const appointmentsRef = admin.firestore().collection("Appointments");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // Mês em Firestore é baseado em 1 (janeiro = 1)
      
      console.log(`Current Year: ${currentYear}, Current Month: ${currentMonth}`);
      
      const snapshot = await appointmentsRef
        .where("patientId", "==", request.params.patientId)
        .where("appointmentDate.year", "==", currentYear) // Mesmo ano
        .where("appointmentDate.month", "==", currentMonth) // Mesmo mês
        .get();
  
      if (snapshot.empty) {
        return response.status(404).json({ message: "No appointments found for this patient in the current month" });
      }
  
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({ appointmentId: doc.id, ...doc.data() });
      });
      
      console.log(appointments);
      
      response.json(appointments);
    } catch (error) {
      console.error("Error getting appointments: ", error);
      response.status(500).json({ message: "Error getting appointments" });
    }  
  },
  getAppointmentsByUserIdInMonth: async (request, response) => {
    console.log("Get Appointments by user Id in month requested");

    try {
        // Obtém o ID do paciente da URL
        const userId = request.params.userId;

        // Obtém o mês da query string e converte para número
        const monthToSearch = parseInt(request.query.month);

        // Obtém o ano atual
        const currentYear = request.query.year ? parseInt(request.query.year) : new Date().getFullYear();

        console.log(`Fetching appointments for Patient ID: ${userId}, Month: ${monthToSearch}, Year: ${currentYear}`);

        if (!monthToSearch || isNaN(monthToSearch) || monthToSearch < 1 || monthToSearch > 12) {
            return response.status(400).json({ message: "Invalid month parameter. Please provide a value between 1 and 12." });
        }

        // Referência ao Firestore
        const appointmentsRef = admin.firestore().collection("Appointments");

        // Busca os agendamentos no Firestore pelo ID do paciente e mês/ano específicos
        const snapshot = await appointmentsRef
            .where("appointmentDate.year", "==", currentYear)
            .where("appointmentDate.month", "==", monthToSearch)
            .get();

        if (snapshot.empty) {
            return response.status(404).json({ message: "No appointments found for this user in the selected month" });
        }

        // Converte os resultados para um array
        const appointments = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.patientId === userId || data.professionalId === userId) {
                appointments.push({ appointmentId: doc.id, ...data });
            }
        });

        console.log(`Found ${appointments.length} appointments`);
        response.json(appointments);

    } catch (error) {
        console.error("Error getting appointments: ", error);
        response.status(500).json({ message: "Error getting appointments" });
    }
  },

  createAppointment: async (request, response) => {
    console.log("Create Appointment");

    try {
        const appointmentsRef = admin.firestore().collection("Appointments");
        console.log(request.body);

        const appointment = {
            patientName: request.body.patientName,
            patientId: request.body.patientId,
            professionalName: request.body.professionalName,
            professionalId: request.body.professionalId,
            appointmentDate: request.body.appointmentDate,
            status: "Solicitada"
        };

        console.log("🔍 Data recebida:", appointment.appointmentDate);

        // Verifica se os dados obrigatórios estão presentes
        if (!appointment.patientId || !appointment.professionalId || !appointment.appointmentDate) {
            return response.status(400).json({
                status: "Erro",
                message: "Dados obrigatórios ausentes para criar a consulta."
            });
        }

        const dayNames = [ "Domingo","Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

        const weekDayValue = new Date(
            appointment.appointmentDate.year,
            appointment.appointmentDate.month - 1,
            appointment.appointmentDate.day
        ).getDay();

        const appointmentDateTime = new Date(
            appointment.appointmentDate.year,
            appointment.appointmentDate.month - 1,
            appointment.appointmentDate.day,
            appointment.appointmentDate.hour,
            appointment.appointmentDate.minutes,
            appointment.appointmentDate.seconds || 0
        );

        console.log(" Verificando disponibilidade para:", appointment.professionalId);
        console.log(" Dia da semana:", weekDayValue, dayNames[weekDayValue]);

        // Verificar disponibilidade do profissional
        const availabilityQuery = await admin.firestore().collection("Availability")
            .where("professionalId", "==", appointment.professionalId)
            .where("dayOfWeek", "==", dayNames[weekDayValue])
            .get();

        console.log(" Documentos encontrados na disponibilidade:", availabilityQuery.docs.length);

        if (availabilityQuery.empty) {
            return response.status(400).json({
                status: "Erro",
                message: "Não há disponibilidade para o profissional neste dia."
            });
        }

        // Pegando o primeiro resultado de disponibilidade
        const availability = availabilityQuery.docs[0].data();

        const availabilityStartTime = new Date(appointmentDateTime);
        const availabilityEndTime = new Date(appointmentDateTime);
        availabilityStartTime.setHours(availability.startHour, availability.startMinute, 0);
        availabilityEndTime.setHours(availability.endHour, availability.endMinute, 0);

        console.log(" Horário de atendimento:", availabilityStartTime, "-", availabilityEndTime);
        console.log(" Horário solicitado:", appointmentDateTime);

        // Valida se o horário solicitado está dentro da disponibilidade
        if (appointmentDateTime < availabilityStartTime || appointmentDateTime > availabilityEndTime) {
            return response.status(400).json({
                status: "Erro",
                message: "O horário da consulta está fora da disponibilidade do profissional."
            });
        }

        console.log(" Verificando conflitos de agendamento...");
        const appointmentConflictQuery = await appointmentsRef
            .where("professionalId", "==", appointment.professionalId)
            .where("appointmentDate.year", "==", appointment.appointmentDate.year)
            .where("appointmentDate.month", "==", appointment.appointmentDate.month)
            .where("appointmentDate.day", "==", appointment.appointmentDate.day)
            .where("appointmentDate.hour", "==", appointment.appointmentDate.hour)
            .where("appointmentDate.minutes", "==", appointment.appointmentDate.minutes)
            .get();

        if (!appointmentConflictQuery.empty) {
            const filteredAppointments = appointmentConflictQuery.docs.filter(doc =>
                doc.data().status !== "Cancelada"
            );

            if (filteredAppointments.length > 0) {
                return response.status(400).json({
                    status: "Erro",
                    message: "Já existe uma consulta marcada para este horário com este profissional."
                });
            }
        }

        console.log(" Criando consulta no Firestore...");
        const docRef = await admin.firestore().collection("Appointments").add(appointment);

        return response.status(201).json({
            status: "Sucesso",
            message: "Consulta criada com sucesso!",
            appointmentId: docRef.id
        });

    } catch (error) {
        console.error(" Erro ao criar consulta:", error);

        return response.status(500).json({
            status: "Erro",
            message: "Ocorreu um erro inesperado ao criar a consulta.",
            details: error.message || "Erro desconhecido"
        });
      }
  },

  updateAppointmentStatus: async (request, response) => {
      try {
        console.log("Updating Appointment Status:", request.params.id);
    
        const appointmentRef = admin.firestore().collection("Appointments").doc(request.params.id);
  
        const doc = await appointmentRef.get();
        if (!doc.exists) {
          return response.status(404).json({ message: "Consulta não encontrada" });
        }
  
        const updates = request.body;
        await appointmentRef.update(updates);
    
        const updatedDoc = await appointmentRef.get();
        return response.json({
          message: "Consulta atualizada com sucesso",
          data: updatedDoc.data(),
        });
      } catch (error) {
        console.error("Erro ao atualizar a Consulta:", error);
        return response.status(500).json({ message: "Erro interno no servidor", error });
      }
    },
};

export default appointmentController;
