// Importa las librerías necesarias de Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa la conexión con tu proyecto de Firebase
admin.initializeApp();

// Importa 'cors' para permitir que tu página web se comunique con esta función
const cors = require("cors")({ origin: true });

// Obtiene una referencia a tu base de datos de Firestore
const db = admin.firestore();

// --- AQUÍ EMPIEZA TU FUNCIÓN DE BACKEND ---
// Se llamará 'handleContactForm' y se activará por una petición HTTP (desde tu web)
exports.handleContactForm = functions.https.onRequest((req, res) => {
  // Usa 'cors' para manejar los permisos de comunicación
  cors(req, res, async () => {
    try {
      // 1. Recibe los datos que tu página web envía en el formulario
      const datosCliente = req.body;

      // 2. Prepara el documento completo para guardarlo en Firestore
      const documentoParaFirestore = {
        ...datosCliente, // Mantiene los campos originales (Nombre completo, Email, etc.)

        // Añade los campos para que la extensión de correo funcione
        // !! CAMBIA ESTE CORREO POR EL TUYO !!
        to: ["juan.camposgomez80@gmail.com"],
        message: {
          subject: `Nuevo prospecto: ${datosCliente["Nombre completo"]}`,
          html: `
            <h1>Nuevo contacto desde la web 🚀</h1>
            <ul>
              <li><strong>Nombre:</strong> ${datosCliente["Nombre completo"]}</li>
              <li><strong>Email:</strong> ${datosCliente["Email"]}</li>
              <li><strong>Teléfono:</strong> ${datosCliente["Telefono"]}</li>
              <li><strong>Servicio de interés:</strong> ${datosCliente["Servicio interez"]}</li>
              <li><strong>Comentario:</strong> ${datosCliente["Comentario"]}</li>
            </ul>
          `,
        },
      };

      // 3. Guarda el documento en la colección 'contactos'
      await db.collection("contactos").add(documentoParaFirestore);

      // 4. Envía una respuesta de éxito a tu página web
      res.status(200).send({ message: "Formulario recibido con éxito!" });
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      // Envía una respuesta de error a tu página web
      res.status(500).send({ error: "Algo salió mal." });
    }
  });
});