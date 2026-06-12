import Swal from 'sweetalert2';

export const swalError = (err) => {
  const msg = err.response?.data?.error || err.message || 'Error desconocido';
  return Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#1e40af' });
};

export const swalSuccess = (mensaje) => {
  return Swal.fire({ icon: 'success', title: 'Correcto', text: mensaje, timer: 2000, showConfirmButton: false });
};

export const swalConfirm = (mensaje) => {
  return Swal.fire({ icon: 'question', title: '¿Estás seguro?', text: mensaje, showCancelButton: true, confirmButtonColor: '#1e40af', cancelButtonColor: '#6b7280', confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' });
};
