import { User } from '../../entity/User';
import { Resolver } from '../../typings/graphql-utils';
import { InputValidationError } from '../../utils/errors';
import { formatYupError } from '../../utils/user-utils';
import { userSchema } from '../validation-rules';

export const register: Resolver = async (
  _,
  args: GQL.IRegisterOnMutationArguments,
  { db },
) => {
  try {
    await userSchema.validate(args, { abortEarly: false });
  } catch (err) {
    const errors = formatYupError(err);

    throw new InputValidationError({
      data: errors,
    });
  }

  const { email, password: pass, name } = args;

  const userExists = await db.getRepository(User).findOne({ where: { email } });
  if (userExists) {
    throw new Error(`${email} is already registered with us`);
  }

  const user = db.getRepository(User).create({
    name: name.trim(),
    email: email.trim(),
    password: pass,
  });

  const userData = await user.save();
  const { password, ...otherFields } = userData;
  return otherFields;
};
