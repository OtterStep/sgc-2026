import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { Usuario } from '../models/index.js';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado para el seed');

    const defaultPassword = await bcrypt.hash('UntSgc2026!', 10);

    const usuarios = [
      {
        codigo: 'ADM-002',
        nombres: 'Admin',
        apellidos: 'Principal',
        correo: 'admin2@unitru.edu.pe',
        contrasena_hash: defaultPassword,
        rol: 'admin',
        activo: true,
      },
      {
        codigo: 'GC-001',
        nombres: 'Gestor',
        apellidos: 'Calidad',
        correo: 'gestor@unitru.edu.pe',
        contrasena_hash: defaultPassword,
        rol: 'gestor_calidad',
        activo: true,
      },
      {
        codigo: 'AUD-001',
        nombres: 'Auditor',
        apellidos: 'Interno',
        correo: 'auditor@unitru.edu.pe',
        contrasena_hash: defaultPassword,
        rol: 'auditor',
        activo: true,
      },
      {
        codigo: 'DOC-001',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'docente@unitru.edu.pe',
        contrasena_hash: defaultPassword,
        rol: 'docente',
        activo: true,
      },
      {
        codigo: 'EST-001',
        nombres: 'Ana',
        apellidos: 'García',
        correo: 'estudiante@unitru.edu.pe',
        contrasena_hash: defaultPassword,
        rol: 'estudiante',
        activo: true,
      },
      {
        codigo: 'EGR-001',
        nombres: 'Carlos',
        apellidos: 'López',
        correo: 'egresado@unitru.edu.pe',
        contrasena_hash: defaultPassword,
        rol: 'egresado',
        activo: true,
      },
      {
        codigo: 'INV-001',
        nombres: 'Invitado',
        apellidos: 'Externo',
        correo: 'invitado@unitru.edu.pe',
        contrasena_hash: defaultPassword,
        rol: 'invitado',
        activo: true,
      }
    ];

    for (const u of usuarios) {
      const existe = await Usuario.findOne({ where: { correo: u.correo } });
      if (!existe) {
        await Usuario.create(u);
        console.log(`Usuario creado: ${u.correo} (${u.rol})`);
      } else {
        console.log(`Usuario ya existe: ${u.correo} (${u.rol})`);
      }
    }

    console.log('✅ Seeding completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    process.exit(1);
  }
};

seed();
