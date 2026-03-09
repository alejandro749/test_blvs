const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// 1. CONFIGURACIÓN (Render asigna el PORT automáticamente)
const PORT = process.env.PORT || 3000;
// Este token es el que debes poner en Render (Environment Variables) 
// y en el Dashboard de Meta.
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mi_token_por_defecto_123";

// 2. ENDPOINT DE VERIFICACIÓN (GET)
// Requerido por Meta para validar que tu servidor es auténtico
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ WEBHOOK VERIFICADO CORRECTAMENTE');
            res.status(200).send(challenge);
        } else {
            console.error('❌ FALLO DE VERIFICACIÓN: Tokens no coinciden');
            res.sendStatus(403);
        }
    }
});

// 3. ENDPOINT DE RECEPCIÓN (POST)
// Aquí es donde WhatsApp envía los mensajes de los usuarios
app.post('/webhook', (req, res) => {
    const body = req.body;
    // ESTO IMPRIMIRÁ CUALQUER COSA QUE LLEGUE, SEA LO QUE SEA
    console.log("🔔 WEBHOOK ACTIVADO:", JSON.stringify(req.body, null, 2));

    // Verificar que el evento provenga de una cuenta de WhatsApp Business
    if (body.object === 'whatsapp_business_account') {
        
        // Estructura de Meta: entry -> changes -> value -> messages
        if (body.entry && 
            body.entry[0].changes && 
            body.entry[0].changes[0].value.messages) {
            
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from; // Número de teléfono del usuario
            const msgBody = message.text ? message.text.body : "(Mensaje no es texto)";

            console.log(`📩 Mensaje recibido de ${from}: ${msgBody}`);

            // AQUÍ PUEDES AÑADIR TU LÓGICA (Ej: Guardar en DB o responder)
        }

        // IMPORTANTE: Responder siempre con 200 OK para que Meta no reintente el envío
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Si no es un evento de WhatsApp
        res.sendStatus(404);
    }
});

// Ruta raíz para verificar que el servidor está vivo
app.get('/', (req, res) => {
    res.send('Servidor de Webhook de WhatsApp funcionando 🚀');
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
