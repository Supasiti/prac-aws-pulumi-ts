import { mockUser } from '../testData/mockUser';
import { handler } from './getUser';

describe('getUser', () => {
  test('should return a user if found', async () => {
    const mockUserDao = {
      getUser: jest.fn().mockResolvedValue(mockUser()),
      createUser: jest.fn(),
    };

    const testEvent = {
      pathParameters: {
        userID: 1,
      },
    } as unknown as AWSLambda.APIGatewayEvent;

    const result = await handler(testEvent, {}, { userDao: mockUserDao });

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).data).toStrictEqual(mockUser());
  });

  describe('error handling', () => {
    test.each([
      {
        testParams: {},
        expectedMessage: 'missing userID',
        description: 'userID is missing',
      },
      {
        testParams: { userID: 'invalid userId' },
        expectedMessage: 'userID must be an integer',
        description: 'userID is not a number',
      },
    ])(
      'should return validation error when $description',
      async ({ testParams, expectedMessage }) => {
        const mockUserDao = {
          getUser: jest.fn().mockResolvedValue(mockUser()),
          createUser: jest.fn(),
        };

        const testEvent = {
          pathParameters: testParams,
        } as unknown as AWSLambda.APIGatewayEvent;

        const result = await handler(testEvent, {}, { userDao: mockUserDao });

        expect(result.statusCode).toEqual(403);
        expect(JSON.parse(result.body)).toStrictEqual(
          expect.arrayContaining([
            { detail: expectedMessage, title: 'HttpError' },
          ]),
        );
      },
    );

    test('should return data not found error when there is no user', async () => {
      const mockUserDao = {
        getUser: jest.fn().mockResolvedValue(undefined),
        createUser: jest.fn(),
      };

      const testEvent = {
        pathParameters: { userID: 1000 },
      } as unknown as AWSLambda.APIGatewayEvent;

      const result = await handler(testEvent, {}, { userDao: mockUserDao });

      expect(result.statusCode).toEqual(404);
      expect(JSON.parse(result.body)).toStrictEqual(
        expect.arrayContaining([
          { detail: 'no user found', title: 'HttpError' },
        ]),
      );
    });

    test('should handle unexpected error', async () => {
      const mockUserDao = {
        getUser: jest.fn().mockRejectedValue(new Error('some error')),
        createUser: jest.fn(),
      };

      const testEvent = {
        pathParameters: { userID: 1000 },
      } as unknown as AWSLambda.APIGatewayEvent;

      const result = await handler(testEvent, {}, { userDao: mockUserDao });

      expect(result.statusCode).toEqual(500);
      expect(JSON.parse(result.body)).toStrictEqual(
        expect.arrayContaining([{ detail: 'some error', title: 'Error' }]),
      );
    });
  });
});
