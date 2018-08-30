import * as yup from 'yup';

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
  rating: yup
    .number()
    .min(0)
    .max(10),
  offerPrice: yup
    .number()
    .min(1)
    .required(),
  price: yup
    .number()
    .min(1)
    .required(),
  publishedYear: yup
    .number()
    .min(1000)
    .max(new Date().getFullYear())
    .required(),
});
