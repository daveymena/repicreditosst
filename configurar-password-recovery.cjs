console.log('🔐 CONFIGURACIÓN DE RECUPERACIÓN DE CONTRASEÑA\n');
console.log('='.repeat(70));
console.log('\n📋 PROBLEMA ACTUAL:');
console.log('   Los emails de recuperación redirigen a Lovable en lugar de tu app\n');

console.log('✅ SOLUCIÓN:');
console.log('   Configurar la URL de redirección en Supabase Dashboard\n');

console.log('='.repeat(70));
console.log('\n📍 PASOS PARA CONFIGURAR:\n');

console.log('1️⃣  Abre Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/beossytirulfjhaeoyeb/auth/url-configuration\n');

console.log('2️⃣  En la sección "Redirect URLs", agrega estas URLs:\n');

// Detectar URLs posibles
const possibleUrls = [
    'http://localhost:8080/restablecer-clave',
    'http://localhost:8080/*',
    'https://tu-dominio.com/restablecer-clave',
    'https://tu-dominio.com/*'
];

possibleUrls.forEach((url, i) => {
    console.log(`   ${i === 0 || i === 1 ? '✅' : '📌'} ${url}`);
});

console.log('\n3️⃣  En "Site URL", configura:');
console.log('   http://localhost:8080  (para desarrollo)');
console.log('   https://tu-dominio.com (para producción)\n');

console.log('4️⃣  Guarda los cambios (botón "Save" al final de la página)\n');

console.log('='.repeat(70));
console.log('\n🧪 CÓMO PROBAR:\n');

console.log('1. Ve a: http://localhost:8080/forgot-password');
console.log('2. Ingresa tu email');
console.log('3. Revisa tu correo');
console.log('4. El link debería redirigir a: http://localhost:8080/restablecer-clave');
console.log('5. Ingresa tu nueva contraseña\n');

console.log('='.repeat(70));
console.log('\n💡 CONFIGURACIÓN ADICIONAL (Opcional):\n');

console.log('📧 Personalizar el email de recuperación:');
console.log('   1. Ve a: Auth → Email Templates');
console.log('   2. Selecciona "Reset Password"');
console.log('   3. Personaliza el mensaje\n');

console.log('🎨 Variables disponibles en el template:');
console.log('   {{ .ConfirmationURL }} - Link de confirmación');
console.log('   {{ .Token }} - Token de recuperación');
console.log('   {{ .TokenHash }} - Hash del token');
console.log('   {{ .SiteURL }} - URL del sitio\n');

console.log('='.repeat(70));
console.log('\n📝 EJEMPLO DE TEMPLATE PERSONALIZADO:\n');

const emailTemplate = `
<h2>Recuperación de Contraseña - RapiCréditos</h2>
<p>Hola,</p>
<p>Recibimos una solicitud para restablecer tu contraseña.</p>
<p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
<a href="{{ .ConfirmationURL }}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Restablecer Contraseña
</a>
<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
<p>Este enlace expira en 1 hora.</p>
<br>
<p>Saludos,<br>Equipo RapiCréditos</p>
`;

console.log(emailTemplate);

console.log('='.repeat(70));
console.log('\n🚀 DESPUÉS DE CONFIGURAR:\n');

console.log('✅ Los usuarios podrán recuperar su contraseña');
console.log('✅ El link redirigirá a tu aplicación');
console.log('✅ Podrán establecer una nueva contraseña\n');

console.log('='.repeat(70));

// Guardar las instrucciones en un archivo
const fs = require('fs');
const instructions = `
# CONFIGURACIÓN DE RECUPERACIÓN DE CONTRASEÑA

## URL de Configuración
https://supabase.com/dashboard/project/beossytirulfjhaeoyeb/auth/url-configuration

## URLs a Agregar en "Redirect URLs"
- http://localhost:8080/restablecer-clave
- http://localhost:8080/*
- https://tu-dominio.com/restablecer-clave (cuando despliegues)
- https://tu-dominio.com/*

## Site URL
- Desarrollo: http://localhost:8080
- Producción: https://tu-dominio.com

## Pasos
1. Abre el link de arriba
2. Agrega las URLs en "Redirect URLs"
3. Configura "Site URL"
4. Haz clic en "Save"
5. Prueba enviando un email de recuperación

## Probar
1. Ve a http://localhost:8080/forgot-password
2. Ingresa tu email
3. Revisa tu correo
4. Haz clic en el link
5. Deberías ver la página de restablecer contraseña
`;

fs.writeFileSync('CONFIGURAR_RECUPERACION_PASSWORD.md', instructions);
console.log('💾 Instrucciones guardadas en: CONFIGURAR_RECUPERACION_PASSWORD.md\n');
