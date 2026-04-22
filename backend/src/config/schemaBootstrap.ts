import { pool } from './database';
import { schemaStatements } from './schemaDefinition';

export const ensureAppSchema = async () => {
  for (const statement of schemaStatements) {
    await pool.query(statement);
  }
};

export default ensureAppSchema;
