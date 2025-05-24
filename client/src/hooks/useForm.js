import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((fieldValues = values) => {
    const newErrors = {};

    Object.keys(validationRules).forEach((field) => {
      const value = fieldValues[field];
      const rules = validationRules[field];

      if (rules.required && !value) {
        newErrors[field] = 'This field is required';
      } else if (rules.pattern && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || 'Invalid format';
      } else if (rules.minLength && value.length < rules.minLength) {
        newErrors[field] = `Minimum length is ${rules.minLength}`;
      } else if (rules.maxLength && value.length > rules.maxLength) {
        newErrors[field] = `Maximum length is ${rules.maxLength}`;
      } else if (rules.custom) {
        const customError = rules.custom(value, fieldValues);
        if (customError) {
          newErrors[field] = customError;
        }
      }
    });

    return newErrors;
  }, [values, validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const newErrors = validate({ ...values, [name]: values[name] });
    setErrors((prev) => ({
      ...prev,
      [name]: newErrors[name],
    }));
  }, [validate, values]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(values);
    }
  }, [validate, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  };
}; 