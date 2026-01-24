const http = require('http');

const data = JSON.stringify({
    phone: '573136174267'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/test-ai-flow',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("🚀 Disparando prueba de IA + WhatsApp...");
console.log("📱 Número destino: 3136174267");
console.log("🧠 Ollama generará el mensaje");
console.log("📨 Se enviará por WhatsApp\n");

const req = http.request(options, (res) => {
    console.log(`\n✅ Respuesta del servidor (${res.statusCode}):\n`);
    res.on('data', (d) => {
        const response = JSON.parse(d.toString());
        console.log("📝 Mensaje generado por IA:");
        console.log("─".repeat(50));
        console.log(response.message || response.error);
        console.log("─".repeat(50));
        if (response.success) {
            console.log("\n🎉 ¡ÉXITO! Revisa tu WhatsApp.");
        } else {
            console.log("\n❌ Error:", response.error);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error de conexión:', error.message);
});

req.write(data);
req.end();
