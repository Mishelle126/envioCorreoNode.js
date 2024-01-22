const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const fs = require('fs');
const handlebars = require('handlebars');

const app = express();

enviarEmail = async () => {
    // Configuración de la conexión a la base de datos local
    const connection = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'facturacionelectronica',
    });

    // Realizar la conexión a la base de datos
    connection.connect();

    // Realizar una consulta a la base de datos
    const [rows, fields] = await connection.promise().query('SELECT * FROM soportefe');

    // Construir el cuerpo del correo 
    const cuerpoCorreo = rows.map(row => {
        return {
            IDLogFacturacionElectronica: row.IDLogFacturacionElectronica,
            lg_clave_acceso: row.lg_clave_acceso,
            lg_estado: row.lg_estado,
            lg_mensaje: row.lg_mensaje,
            rst_id: row.rst_id,
            cfac_id: row.cfac_id,
            lg_fecha: row.lg_fecha,
            replica: row.replica,
        };
    });

    // Leer el archivo HTML
    const htmlTemplate = fs.readFileSync('correo.html', 'utf-8');

    // Compilar el template Handlebars
    const compiledTemplate = handlebars.compile(htmlTemplate);

    // Reemplazar {{#rows}} y {{/rows}} con el contenido real
    const cuerpoCorreoHTML = compiledTemplate({ rows: cuerpoCorreo });

    // Configuración del transporte de correo
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'mishelleabendano2@gmail.com',
            pass: 'ctfc kodz nvot eyiq',
        },
    });

    // Configuración del mensaje de correo
    const mensaje = {
        from: 'mishelleabendano2@gmail.com',
        to: 'dmg.abendano@yavirac.edu.ec',
        subject: 'Correo de pruebas desde Node.js con información de la base de datos',
        html: cuerpoCorreoHTML,  // Usar cuerpo HTML formateado
    };

    // Enviar el correo
    const info = await transporter.sendMail(mensaje);

    console.log(info);

    // Cerrar la conexión a la base de datos
    connection.end();
};

enviarEmail();

// Definir la tarea programada con node-cron para ejecutarse a la hora especificada UTC
cron.schedule('*/1 * * * *', () => {
    enviarEmail();
});


// Configurar la ruta en Express para probar manualmente el envío de correo
app.get('/', (req, res) => {
    res.send('Correo enviado');
});


// Iniciar Express en el puerto que desees
const puerto = 3000;
app.listen(puerto, () => {
    console.log(`Servidor Express iniciado en el puerto ${puerto}`);
});

express();