import { User } from '@prisma/client';

export const userFilter = (user: User) => {
  const { id, email, username, surname, name } = user;
  return { id, username, email, surname, name };
};
