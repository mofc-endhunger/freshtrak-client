import { useState, useEffect } from "react";

interface FormErrors {
  [key: string]: string;
}

interface Validations {
  [key: string]: string[];
}

interface UseFormProps {
  onFormErrors: (errors: FormErrors) => void;
}

const UseForm = (
  props: UseFormProps,
  validations: Validations,
  callback: () => void,
  errorToComponent: boolean = false
) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const formValidation = (value: string | number, validator: string, limit?: string): string => {
    let valueLength: number;
    if (typeof value === 'number') {
      valueLength = value;
    } else {
      valueLength = value.length;
    }

    switch (validator) {
      case "required":
        return valueLength > 0 ? "" : "This field is required";
      case "min":
        return valueLength >= parseInt(limit || '0')
          ? ""
          : `This value needs to be at least ${limit} characters`;
      case "max":
        return valueLength <= parseInt(limit || '0')
          ? ""
          : `This value cannot be more than ${limit} characters`;
      case "is_address":
        const validAddress = new RegExp("^[-().,#\/a-zA-Z0-9 ]*$");
        const errors_address = validAddress.test(value as string);
        return errors_address
          ? ""
          : `Enter a valid address`;
      default:
        return "";
    }
  };

  const handleErrors = (e: React.ChangeEvent<HTMLInputElement> | any): void => {
    if (typeof e.target === "undefined") {
      const data = e;
      let count = 0;
      for (const key in data) {
        // get index and check for last index and set true
        const keyExists = key in validations;
        if (keyExists) {
          count++;
          if (count === Object.keys(validations).length) {
            processValidations(data[key], validations[key], key, true);
            return;
          } else {
            processValidations(data[key], validations[key], key);
          }
        }
      }
    } else {
      const { name, value } = e.target;
      const nameExists = name in validations;
      if (nameExists) {
        processValidations(value, validations[name], name);
      }
    }
  };

  const processValidations = (value: string | number, validate: string[], name: string, lastLoop?: boolean): boolean | void => {
    let validationRes: string = "";
    let validator: string;
    let limit: string = "";
    let count = 0;

    for (let i = 0; i < validate.length; i++) {
      count++;
      const splitKey = validate[i].split(':');
      if (typeof splitKey[1] !== 'undefined') {
        validator = splitKey[0];
        limit = splitKey[1];
      } else {
        validator = validate[i];
      }

      if (typeof validator === "string") {
        validationRes = formValidation(value, validator, limit);
      }
      if (validationRes) break;
    }

    setErrors(errors => ({
      ...errors,
      [name]: validationRes
    }));

    if (count >= 1 && lastLoop) {
      if (validationRes) {
        return true;
      }
      return false;
    }
  };

  useEffect(() => {
    for (const keys in errors) {
      if (errors[keys] === null || errors[keys] === "") {
        delete errors[keys];
      }
    }

    if (Object.keys(errors).length === 0) {
      callback();
    }

    if (!errorToComponent) {
      props.onFormErrors(errors);
    }
  }, [errors, callback, errorToComponent, props]);

  return {
    handleErrors,
    errors
  };
};

export default UseForm; 