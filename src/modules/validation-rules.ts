import * as yup from 'yup';

export const userSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(3)
    .max(100),
  email: yup
    .string()
    .trim()
    .min(6)
    .max(255)
    .email(),
  password: yup
    .string()
    .min(6)
    .max(255),
});
