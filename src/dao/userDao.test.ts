import { createUser, getUser } from './userDao';
import { mockCreateUserParams, mockUser } from '../testData/mockUser';

describe('userDao', () => {
  describe('getUser', () => {
    test("should return undefined if it doesn't exist", async () => {
      const mockDbClient = {
        send: jest.fn().mockResolvedValue({}),
      } as any;
      const user = await getUser(4000, { dbClient: mockDbClient });

      expect(user).toBeUndefined();
    });

    test('should return user from a userID', async () => {
      const mockDbClient = {
        send: jest.fn().mockResolvedValue({ Item: mockUser() }),
      } as any;
      const user = await getUser(1, { dbClient: mockDbClient });

      expect(user).toStrictEqual(mockUser());
    });
  });

  describe('createUser', () => {
    test('should successfully create user', async () => {
      const mockDb: Record<string, any> = {};

      const mockDbClient = {
        send: jest.fn().mockImplementation((params: any) => {
          mockDb[params.input.Item.userID] = params.input.Item;

          return {
            $metadata: {
              httpStatusCode: 200,
            },
          };
        }),
      } as any;

      const testParams = mockCreateUserParams();
      const expected = expect.objectContaining({
        ...testParams,
        userID: expect.any(Number),
      });

      const result = await createUser(testParams, { dbClient: mockDbClient });

      expect(result).toStrictEqual(expected);
      expect(mockDb[result.userID]).toStrictEqual(expected);
    });

    test('should throw when there is error', async () => {
      const mockDbClient = {
        send: jest.fn().mockImplementation(() => {
          return {
            $metadata: {
              httpStatusCode: 500,
            },
          };
        }),
      } as any;

      const testParams = mockCreateUserParams();

      await expect(async () => {
        await createUser(testParams, { dbClient: mockDbClient });
      }).rejects.toThrow();
    });
  });
});
