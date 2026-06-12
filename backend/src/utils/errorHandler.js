export const formatError = (err) => {
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.map(e => e.message).join('. ');
  }
  if (err.parent?.detail) {
    return err.parent.detail;
  }
  return err.message || 'Error desconocido';
};
