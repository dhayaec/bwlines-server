import { Env, TokenTypes } from '../../constants';
import { User } from '../../entity/User';
import { Resolver } from '../../typings/app-utility-types';
import { createTokenLink } from '../../utils/user-utils';
import { checkAdminRights, validateInputs } from '../../utils/utils';
import { userSchema } from '../validation-rules';
// import { renderEmail } from './../../emails/emails';
// import { sendEmail } from './../../utils/utils';

export const register: Resolver = async (
  _,
  args: GQL.IRegisterOnMutationArguments,
  { db, url, redis, session },
) => {
  const { admin = false } = args;

  if (admin) {
    checkAdminRights(session);
  }

  await validateInputs(userSchema, args);

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
    isAdmin: !!admin,
  });

  const userData = await user.save();

  const confirmLink = await createTokenLink(
    url,
    userData.id,
    redis,
    TokenTypes.confirm,
  );

  console.log(confirmLink);

  const {
    id,
    email: emailAddress,
    name: uName,
    mobile: mobileNumber,
  } = userData;

  session.userId = id;
  session.name = uName;
  session.email = emailAddress;
  session.mobile = mobileNumber;

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
