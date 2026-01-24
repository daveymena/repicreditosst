const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/test-message?phone=573136174267&message=PruebaParams',
    method: 'POST'
};

const req = http.request(options, (res) => {
    console.log(`Estado: ${res.statusCode}`);
    res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (e) => console.error(e));
req.end();
console.log("Enviando via params...");
