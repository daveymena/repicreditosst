const http = require('http');

const data = JSON.stringify({
    phone: '573136174267', // Agrego código de país 57 asumiendo Colombia por el número
    message: '👋 Hola! Este es un recordatorio de prueba desde RapiCréditos Pro. Tu préstamo #001 vence pronto. (Mensaje automático)'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/test-message',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Estado: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
console.log("Enviando mensaje a 3136174267...");
