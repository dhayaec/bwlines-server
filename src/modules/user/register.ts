import { Env } from '../../constants';
import { User } from '../../entity/User';
import { Resolver } from '../../typings/app-utility-types';
import { InputValidationError } from '../../utils/errors';
import { createConfirmEmailLink, formatYupError } from '../../utils/user-utils';
import { userSchema } from '../validation-rules';
// import { renderEmail } from './../../emails/emails';
// import { sendEmail } from './../../utils/utils';

export const register: Resolver = async (
  _,
  args: GQL.IRegisterOnMutationArguments,
  { db, url, redis },
) => {
  try {
    await userSchema.validate(args, { abortEarly: false });
  } catch (err) {
    const errors = formatYupError(err);

    throw new InputValidationError({
      data: errors,
    });
  }

  const { email, password: pass, name, mobile } = args;

  const userExists = await db.getRepository(User).findOne({ where: { email } });
  if (userExists) {
    throw new Error(`${email} is already registered with us`);
  }

  const user = db.getRepository(User).create({
    name: name.trim(),
    email: email.trim(),
    password: pass,
    mobile: mobile && mobile.length > 0 ? mobile.trim() : '',
  });

  const userData = await user.save();
  const confirmLink = await createConfirmEmailLink(url, userData.id, redis);
  console.log(confirmLink);

  if (process.env.NODE_ENV !== Env.test) {
    // const subject = 'Confirm your email address';
    // const message = `
    // <p>Please click on the link below to confirm your email address.</p>
    // <div>${confirmLink}</div>
    // `;
    // const emailHtml = renderEmail({
    //   subject,
    //   message,
    // });
    // await sendEmail({
    //   subject,
    //   to: userData.email,
    //   text: subject,
    //   html: emailHtml,
    // });
  }

  return userData;
};
