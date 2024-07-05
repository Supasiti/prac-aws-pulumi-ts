import { log } from '../common/logger';
import { DataNotFoundError, ValidationError } from '../common/error';
import { error, success } from '../common/jsonResponse';
import * as userDaoMod from '../dao/userDao';
import { UserDao } from '../dao/types';

type HandlerDeps = {
  userDao: UserDao;
};

export const handler = async (
  event: AWSLambda.APIGatewayEvent,
  _ctx: Partial<AWSLambda.Context>,
  _deps?: HandlerDeps,
) => {
  log.info(event, 'getUser Event');

  // istanbul ignore next
  const { userDao = userDaoMod } = _deps || {};

  try {
    // istanbul ignore next
    const { userID } = event.pathParameters || {};

    const params = validateRequest(userID);

    const user = await userDao.getUser(params);
    if (!user) {
      throw DataNotFoundError('no user found');
    }

    log.info(user, 'getUser response data');
    return success({ data: user });
  } catch (err) {
    log.error(err);
    return error(err as Error);
  }
};

function validateRequest(params?: string): number {
  if (!params) {
    throw ValidationError('missing userID');
  }

  const result = parseInt(params, 10);
  if (Number.isNaN(result)) {
    throw ValidationError('userID must be an integer');
  }
  return result;
}
