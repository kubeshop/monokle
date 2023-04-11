import {Primitive} from 'type-fest';

export const formatFormData = (formData: Record<string, Primitive>) => {
  return Object.fromEntries(
    Object.entries(formData).map(([key, value]) => {
      if (!value || typeof value !== 'string') {
        return [key, value];
      }

      if (key.toLowerCase().includes('ssh') || key.toLowerCase().includes('key')) {
        return [key, value.replaceAll(' ', '')];
      }

      return [key, value];
    })
  );
};
