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

  createAppointment: async (request, response) => {
    console.log("Create Appointment");
    const appointment = {
      patientName: request.body.patientName,
      patientId: request.body.patientId,
      professionalName: request.body.professionalName,
      professionalId: request.body.professionalId,
      appointmentDate: request.body.appointmentDate,
    };

    console.log("date: " + appointment.appointmentDate);
    

    try {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      console.log(appointment.appointmentDate.year + " " + appointment.appointmentDate.month + " " + appointment.appointmentDate.day);
      
      const weekDayValue = new Date(
        appointment.appointmentDate.year,
        appointment.appointmentDate.month - 1,
        appointment.appointmentDate.day
      ).getDay();
      const appointmentDateTime = new Date(
        appointment.appointmentDate.year,
        appointment.appointmentDate.month - 1, // Mês começa do zero em JavaScript
        appointment.appointmentDate.day,
        appointment.appointmentDate.hour,
        appointment.appointmentDate.minutes,
        appointment.appointmentDate.seconds
      );

      //verificação da disponibilidade
      console.log("dayVaule " + weekDayValue + " dayName " + dayNames[weekDayValue]);
      const availabilityQuery = await admin
        .firestore()
        .collection("Availability")
        .where("professionalId", "==", appointment.professionalId)
        .where("dayOfWeek", "==", dayNames[weekDayValue])
        .get();

      //verifica se o dia está dentro da disponibilidade
      if (availabilityQuery.empty) {
        return response
          .status(400)
          .json({
            status: "Erro",
            message: "Não há disponibilidade para o profissional neste dia.",
          }); //seguir esse padrão de responses
      }

      const availability = availabilityQuery.docs[0].data();
      const availabilityStartTime = new Date(appointmentDateTime);
      const availabilityEndTime = new Date(appointmentDateTime);

      availabilityStartTime.setHours(
        availability.startHour,
        availability.startMinute,
        0
      );
      availabilityEndTime.setHours(
        availability.endHour,
        availability.endMinute,
        0
      );

      // verifica se  a hora esta dentro da disponibilidade
      if (
        appointmentDateTime < availabilityStartTime ||
        appointmentDateTime > availabilityEndTime
      ) {
        return response
          .status(400)
          .json({
            status: "Erro",
            message:
              "O horário da consulta está fora da disponibilidade do profissional.",
          });
      }

      //verifica outras consultas marcadas
      const appointmentConflictQuery = await admin
        .firestore()
        .collection("Appointments")
        .where("professionalId", "==", appointment.professionalId)
        .where("appointmentDate.year", "==", appointment.appointmentDate.year)
        .where("appointmentDate.month", "==", appointment.appointmentDate.month)
        .where("appointmentDate.day", "==", appointment.appointmentDate.day)
        .where("appointmentDate.hour", "==", appointment.appointmentDate.hour)
        .where(
          "appointmentDate.minutes",
          "==",
          appointment.appointmentDate.minutes
        )
        .get();

      if (!appointmentConflictQuery.empty) {
        return response.status(400).json({
          status: "Erro",
          message:
            "Já existe uma consulta marcada para este horário com este profissional.",
        });
      }

      // caso não houver conflitos
      const docRef = await admin
        .firestore()
        .collection("Appointments")
        .add(appointment);

      response.json({
        status: "Consulta criada com sucesso!",
        appointmentId: docRef.id,
      });
    } catch (error) {
      response.json({ status: "Erro ao criar consulta", message: error.stack });
    }
  },
};

export default appointmentController;
