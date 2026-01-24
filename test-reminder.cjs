const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/scheduler/run-now',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`Estado: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`Respuesta: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`Problema con la petición: ${e.message}`);
});

req.end();
console.log("Enviando comando de prueba al backend...");
