import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const initToasterContainer = () => {
  return {
    hideProgressBar: true,
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000,
    enter: "fadeIn",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
  };
};

export const showMessage = (type: 'success' | 'error' | 'warning', message: string): void => {
  switch (type) {
    case 'success':
      toast.success(message, initToasterContainer());
      break;
    case 'error':
      toast.error(message, initToasterContainer());
      break;
    default:
      toast.warn(message, initToasterContainer());
      break;
  }
};

export const confirm = (title: string, successFn: (value: any, object?: any) => void, object?: any): void => {
  Swal.fire({
    title: title,
    icon: 'warning',
    showCancelButton: true
  }).then((result) => {
    if (result.value) {
      successFn(result.value, object);
    }
  });
};

export const setItemToLocalStorage = (storageKey: string, storageValue: any): void => {
  localStorage.setItem(storageKey, JSON.stringify(storageValue));
};

export const getItemLocalStorage = (storageKey: string): string | null => {
  const key = "" + storageKey;
  return localStorage.getItem(key);
};

export const clearItemsFromLocalStorage = (): void => {
  localStorage.clear();
}; 