import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['contrasena_hash'] },
      order: [['creado_en', 'DESC']]
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { codigo, nombres, apellidos, correo, contrasena, rol, facultad, escuela } = req.body;
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) return res.status(400).json({ error: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({
      codigo, nombres, apellidos, correo, contrasena_hash: hash, rol, facultad, escuela,
      creado_por: req.usuario.id,
      modificado_por: req.usuario.id,
    });
    
    // Devolvemos el usuario sin la contraseña
    const usuarioResponse = usuario.toJSON();
    delete usuarioResponse.contrasena_hash;

    res.status(201).json(usuarioResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { codigo, nombres, apellidos, rol, facultad, escuela, activo } = req.body;
    
    await Usuario.update({
      codigo, nombres, apellidos, rol, facultad, escuela, activo,
      modificado_por: req.usuario.id
    }, { where: { id } });

    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    await Usuario.update({ activo: false, modificado_por: req.usuario.id }, { where: { id } });
    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
