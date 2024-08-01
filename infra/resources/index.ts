import { createTable } from './dynamodb';
import { rootId } from '../constant';

const userTableName = `${rootId}-user`;

export const table = createTable({ tableName: userTableName });
