
const https = require('https');

const data = JSON.stringify({
    model: 'llama3.2:1b',
    prompt: 'Hola',
    stream: false
});

const options = {
    hostname: 'ollama-rapiredissas.ginee6.easypanel.host',
    path: '/api/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    },
    timeout: 10000
};

console.log("Conectando a Ollama...");

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log("✅ ÉXITO: Ollama respondió:", JSON.parse(body).response);
        } else {
            console.log("❌ ERROR DEL SERVIDOR:", res.statusCode, body);
        }
    });
});

req.on('error', (e) => {
    console.error("🚨 ERROR DE CONEXIÓN:", e.message);
});

req.write(data);
req.end();
