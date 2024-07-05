// Get the table name from CDK, but use Users for local development
export const TABLE_NAME = process.env.USER_TABLE_NAME || 'Users';

export const getPrimaryKey = (userID: number) => `${userID}`;

export const getUserSortKey = () => 'USER';

export function toGetUserKey(userID: number) {
  return {
    $pk: getPrimaryKey(userID),
    $sk: getUserSortKey(),
  };
}

export const USER_SCHEMA = 'USER';

export const PRIVATE_FIELD_INDICATOR = '$';

export function stripPrivateFields<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    if (key[0] !== PRIVATE_FIELD_INDICATOR) {
      result[key] = obj[key];
    }
  }
  return result as T;
}
