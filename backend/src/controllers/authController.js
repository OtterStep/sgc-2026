import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';
import { formatError } from '../utils/errorHandler.js';

export const registrar = async (req, res) => {
  try {
    const { codigo, nombres, apellidos, correo, contrasena, rol, facultad, escuela } = req.body;
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) return res.status(400).json({ error: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({
      codigo, nombres, apellidos, correo, contrasena_hash: hash, rol, facultad, escuela,
      creado_por: null, modificado_por: null,
    });
    res.status(201).json({ id: usuario.id, mensaje: 'Usuario registrado' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { correo, activo: true } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valido = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!valido) return res.status(401).json({ error: 'Credenciales inválidas' });

    await Usuario.update({ ultimo_acceso: new Date() }, { where: { id: usuario.id } });

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol, nombres: usuario.nombres },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, usuario: { id: usuario.id, nombres: usuario.nombres, apellidos: usuario.apellidos, rol: usuario.rol } });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['contrasena_hash'] },
    });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};
