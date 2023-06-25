import { User } from '@prisma/client';

export const userFilter = (user: User) => {
  const { id, email, firstName, lastName, isBusiness } = user;
  return { id, email, firstName, lastName, isBusiness };
};
