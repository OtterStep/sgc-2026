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

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { activo: true },
      attributes: ['id', 'nombres', 'apellidos', 'codigo'],
      order: [['apellidos', 'ASC']],
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const { contrasena_actual, nueva_contrasena } = req.body;
    if (!contrasena_actual || !nueva_contrasena) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (nueva_contrasena.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(contrasena_actual, usuario.contrasena_hash);
    if (!valido) return res.status(400).json({ error: 'La contraseña actual no es correcta' });

    const hash = await bcrypt.hash(nueva_contrasena, 10);
    await Usuario.update(
      { contrasena_hash: hash, modificado_por: req.usuario.id },
      { where: { id: req.usuario.id } }
    );

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};

export const restablecerPasswordAdmin = async (req, res) => {
  try {
    const { usuario_id, nueva_contrasena } = req.body;
    if (!usuario_id || !nueva_contrasena) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (nueva_contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const hash = await bcrypt.hash(nueva_contrasena, 10);
    await Usuario.update(
      { contrasena_hash: hash, modificado_por: req.usuario.id },
      { where: { id: usuario_id } }
    );

    res.json({ mensaje: `Contraseña restablecida correctamente para ${usuario.nombres} ${usuario.apellidos}` });
  } catch (err) {
    res.status(500).json({ error: formatError(err) });
  }
};
