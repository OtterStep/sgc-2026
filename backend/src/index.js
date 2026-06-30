import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import routes from './routes/index.js';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/v1', routes);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date(), version: '1.0.0' }));

const PORT = process.env.PORT || 3001;

const esperarDB = async (intentos = 10, intervalo = 3000) => {
  for (let i = 1; i <= intentos; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ PostgreSQL conectado');
      return;
    } catch (err) {
      console.log(`⏳ Intento ${i}/${intentos} - PostgreSQL no disponible, reintentando en ${intervalo / 1000}s...`);
      if (i === intentos) {
        console.error('❌ Error al conectar con PostgreSQL:', err.message);
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, intervalo));
    }
  }
};

const ejecutarMigraciones = async () => {
  try {
    await sequelize.query('ALTER TABLE sgc.capas ALTER COLUMN responsable_id DROP NOT NULL');
    console.log('✅ Migración: responsable_id nullable en capas');
  } catch {
    // La columna ya es nullable o no existe, ignorar
  }
};

const iniciar = async () => {
  await esperarDB();
  await ejecutarMigraciones();
  app.listen(PORT, () => console.log(`🚀 SGC Backend en puerto ${PORT}`));
};

iniciar();
