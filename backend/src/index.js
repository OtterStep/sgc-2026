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

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado');
    app.listen(PORT, () => console.log(`🚀 SGC Backend en puerto ${PORT}`));
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

iniciar();
