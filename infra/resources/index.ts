import { createTable, seedUserTable } from './dynamodb';
import { rootId } from '../constant';
import { userData } from './seedData';

const userTableName = `${rootId}-user`;

export const table = createTable({ tableName: userTableName });

seedUserTable(table, userData);
