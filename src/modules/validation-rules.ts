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

export const bookSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .min(3)
    .max(255),
  coverImage: yup
    .string()
    .trim()
    .min(3)
    .max(255),
  isbn: yup
    .string()
    .trim()
    .max(13),
  description: yup
    .string()
    .trim()
    .min(140),
  listPrice: yup.number().required(),
  displayPrice: yup.number().required(),
  datePublished: yup.date().required(),
});
