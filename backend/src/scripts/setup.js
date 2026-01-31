import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
    const password = process.argv[2];
    if (!password) {
        console.error('❌ Error: Debes proporcionar la contraseña de base de datos como argumento.');
        console.log('Uso: node setup.js TU_CONTRASEÑA');
        process.exit(1);
    }

    const config = {
        connectionString: `postgresql://postgres:${password}@db.isltixhneucqgmqicwwo.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    };

    const client = new pg.Client(config);

    try {
        console.log('⏳ Conectando a Supabase...');
        await client.connect();
        console.log('✅ Conexión exitosa.');

        const sqlPath = path.join(__dirname, '../../../supabase_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('⏳ Ejecutando esquema SQL...');
        await client.query(sql);
        console.log('🚀 ¡Estructura de Base de Datos creada con éxito!');

    } catch (err) {
        console.error('❌ Error durante la migración:', err.message);
    } finally {
        await client.end();
    }
}

runMigration();
