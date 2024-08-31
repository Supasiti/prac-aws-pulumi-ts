export type CreateUserParams = {
  name: string;
  email: string;
  balance: number;
  userID?: number;
};

export type User = Required<CreateUserParams>;
