export const formatError = (err) => {
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.map(e => e.message).join('. ');
  }
  if (err.parent?.detail) {
    return err.parent.detail;
  }
  return err.message || 'Error desconocido';
};

/**
 * Valida si una cadena es un UUID válido
 * @param {string} uuid - La cadena a validar
 * @returns {boolean} - true si es un UUID válido, false en caso contrario
 */
export const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Limpia un objeto eliminando campos con valores vacíos o nulos
 * @param {object} obj - El objeto a limpiar
 * @returns {object} - El objeto limpio
 */
export const cleanObject = (obj) => {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '') {
      delete cleaned[key];
    }
  });
  return cleaned;
};

/**
 * Prepara los datos para crear un modelo, eliminando campos UUID inválidos
 * @param {object} data - Los datos a preparar
 * @param {string[]} uuidFields - Los nombres de los campos que son UUID
 * @returns {object} - Los datos preparados
 */
export const prepareCreateData = (data, uuidFields = []) => {
  const cleaned = cleanObject(data);
  uuidFields.forEach(field => {
    if (cleaned[field] !== undefined && !isValidUUID(cleaned[field])) {
      delete cleaned[field];
    }
  });
  return cleaned;
};
