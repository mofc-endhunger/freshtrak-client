import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const initToasterContainer = () => {
  this.options = {
    hideProgressBar: true,
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000,
    enter: 'fadeIn',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
  };
};

export const showMessage = (type, message) => {
  switch (type) {
    case 'success':
      toast.success(message, initToasterContainer);
      break;
    case 'error':
      toast.error(message, initToasterContainer);
      break;
    default:
      toast.warn(message, initToasterContainer);
      break;
  }
};

export const confirm = (title, successFn, object) => {
  let response;
  Swal.fire({
    title: title,
    icon: 'warning',
    showCancelButton: true,
  }).then((result) => {
    if (result.value) {
      successFn(result.value, object);
    } else {
      response = false;
    }
    return response;
  });
};

/**
 * @deprecated Use StorageService.setItem() instead
 * This function is kept for backward compatibility but will be removed in a future version.
 */
export const setItemToLocalStorage = (storageKey, storageValue) => {
  // Import StorageService dynamically to avoid circular dependencies
  const { StorageService } = require('./StorageService');
  return StorageService.setItem(storageKey, storageValue, 'local');
};

/**
 * @deprecated Use StorageService.getItem() instead
 * This function is kept for backward compatibility but will be removed in a future version.
 * Note: This returns the raw string value for backward compatibility.
 * Use StorageService.getItem() for automatic JSON parsing.
 */
export const getItemLocalStorage = (storageKey) => {
  // Import StorageService dynamically to avoid circular dependencies
  const { StorageService } = require('./StorageService');
  const item = StorageService.getItem(storageKey, 'local');
  // Return as string for backward compatibility with existing code
  return item ? (typeof item === 'string' ? item : JSON.stringify(item)) : null;
};

/**
 * @deprecated Use StorageService.clear() instead
 * This function is kept for backward compatibility but will be removed in a future version.
 * WARNING: This clears ALL localStorage, not just app data.
 * Consider using StorageService.clearAuthData() or specific removeItem() calls instead.
 */
export const clearItemsFromLocalStorage = () => {
  // Import StorageService dynamically to avoid circular dependencies
  const { StorageService } = require('./StorageService');
  return StorageService.clear('local');
};
