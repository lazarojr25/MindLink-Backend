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
        appointments.push({ id: doc.id, ...doc.data() });
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
        appointments.push({ id: doc.id, ...doc.data() });
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
                appointments.push({ id: doc.id, ...data });
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
  
    const appointment = {
      patientName: request.body.patientName,
      patientId: request.body.patientId,
      professionalName: request.body.professionalName,
      professionalId: request.body.professionalId,
      appointmentDate: request.body.appointmentDate,
    };
  
    console.log("date: " + JSON.stringify(appointment.appointmentDate));
  
    try {
      const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday",
      ];
  
      const weekDayValue = new Date(
        appointment.appointmentDate.year,
        appointment.appointmentDate.month - 1, // Mês começa do zero
        appointment.appointmentDate.day
      ).getDay();
  
      const appointmentDateTime = new Date(
        appointment.appointmentDate.year,
        appointment.appointmentDate.month - 1,
        appointment.appointmentDate.day,
        appointment.appointmentDate.hour,
        appointment.appointmentDate.minutes,
        0 // Zerando segundos para consistência
      );
  
      console.log(`Weekday: ${weekDayValue} (${dayNames[weekDayValue]})`);
  
      // 🔹 Verificação da disponibilidade do profissional
      let availabilityQuery = await admin
        .firestore()
        .collection("Availability")
        .where("professionalId", "==", appointment.professionalId)
        .where("dayOfWeek", "==", dayNames[weekDayValue])
        .get();
  
      let availableSlots = availabilityQuery.docs
        .map(doc => doc.data())
        .filter(avail => avail.status !== "Cancelado");
  
      if (availableSlots.length === 0) {
        return response.status(400).json({
          status: "Erro",
          message: "Não há disponibilidade para o profissional neste dia.",
        });
      }
  
      // 🔹 Verifica se o horário do agendamento está dentro do horário disponível
      const availability = availableSlots[0]; // Supondo que há apenas um registro por dia
      const availabilityStartTime = new Date(appointmentDateTime);
      const availabilityEndTime = new Date(appointmentDateTime);
  
      availabilityStartTime.setHours(availability.startHour, availability.startMinute, 0);
      availabilityEndTime.setHours(availability.endHour, availability.endMinute, 0);
  
      if (
        appointmentDateTime < availabilityStartTime ||
        appointmentDateTime > availabilityEndTime
      ) {
        return response.status(400).json({
          status: "Erro",
          message: "O horário da consulta está fora da disponibilidade do profissional.",
        });
      }
  
      // 🔹 Verifica conflitos com outras consultas marcadas
      const startTime = new Date(appointmentDateTime);
      const endTime = new Date(appointmentDateTime);
      endTime.setMinutes(endTime.getMinutes() + 30); // Supondo duração de 30 minutos
  
      const appointmentConflictQuery = await admin
        .firestore()
        .collection("Appointments")
        .where("professionalId", "==", appointment.professionalId)
        .where("appointmentTimestamp", ">=", startTime.getTime())
        .where("appointmentTimestamp", "<", endTime.getTime())
        .get();
  
      if (!appointmentConflictQuery.empty) {
        return response.status(400).json({
          status: "Erro",
          message: "Já existe uma consulta marcada para este horário com este profissional.",
        });
      }
  
      // 🔹 Criando a consulta sem conflitos
      const appointmentData = {
        ...appointment,
        appointmentTimestamp: appointmentDateTime.getTime(), // Adiciona timestamp para melhor busca
      };
  
      const docRef = await admin.firestore().collection("Appointments").add(appointmentData);
  
      return response.json({
        status: "Consulta criada com sucesso!",
        appointmentId: docRef.id,
      });
  
    } catch (error) {
      console.error("Erro ao criar consulta:", error);
      return response.status(500).json({
        status: "Erro ao criar consulta",
        message: error.message,
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
