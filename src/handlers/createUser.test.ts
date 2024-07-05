import { mockCreateUserParams, mockUser } from '../testData/mockUser';
import { handler } from './createUser';

describe('createUser', () => {
   test('should create a new user', async () => {
    const mockUserDao = {
      getUser: jest.fn(),
      createUser: jest.fn().mockResolvedValue(mockUser()),
    };

    const testEvent = {
      body: JSON.stringify(mockCreateUserParams()),
    } as unknown as AWSLambda.APIGatewayEvent;

    const result = await handler(testEvent, {}, { userDao: mockUserDao });

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).data).toStrictEqual(mockUser());
  });

  describe('error handling', () => {
    const testUser = mockUser();

    test.each([
      {
        testParams: null,
        expectedMessage: 'missing user details',
        description: 'missing body',
      },
      {
        testParams: JSON.stringify({
          balance: testUser.balance,
          email: testUser.email,
        }),
        expectedMessage: 'missing name',
        description: 'name is missing',
      },
      {
        testParams: JSON.stringify({
          balance: testUser.balance,
          name: testUser.name,
        }),
        expectedMessage: 'missing email',
        description: 'email is missing',
      },
      {
        testParams: JSON.stringify({
          name: testUser.name,
          email: testUser.email,
        }),
        expectedMessage: 'missing balance',
        description: 'balance is missing',
      },
    ])(
      'should return validation error when $description',
      async ({ testParams, expectedMessage }) => {
        const mockUserDao = {
          createUser: jest.fn().mockResolvedValue(mockUser()),
          getUser: jest.fn(),
        };
        const mockSns = {
          publish: jest.fn(),
        };

        const testEvent = {
          body: testParams,
        } as unknown as AWSLambda.APIGatewayEvent;

        const result = await handler(testEvent, {}, { userDao: mockUserDao });

        expect(result.statusCode).toEqual(403);
        expect(JSON.parse(result.body)).toStrictEqual(
          expect.arrayContaining([
            { detail: expectedMessage, title: 'HttpError' },
          ]),
        );
        expect(mockSns.publish).not.toHaveBeenCalled();
      },
    );

    test('should handle unexpected error', async () => {
      const mockUserDao = {
        createUser: jest.fn().mockRejectedValue(new Error('some error')),
        getUser: jest.fn(),
      };

      const testEvent = {
        body: JSON.stringify(mockUser()),
      } as unknown as AWSLambda.APIGatewayEvent;

      const result = await handler(testEvent, {}, { userDao: mockUserDao });

      expect(result.statusCode).toEqual(500);
      expect(JSON.parse(result.body)).toStrictEqual(
        expect.arrayContaining([{ detail: 'some error', title: 'Error' }]),
      );
    });
  });
});
