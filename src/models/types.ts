export type User = {
  name: string;
  email: string;
  balance: number;
  userID: number;
};

export type CreateUserParams = Omit<User, 'userID'>;
