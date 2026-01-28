
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
