import { pool } from './database';
import { schemaStatements } from './schemaDefinition';

const USERS_PHONE_UNIQUE_INDEX = 'idx_users_phone_unique';

const isPhoneUniqueIndexCreationFailure = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const pgError = error as { code?: string; constraint?: string; detail?: string };
  const detailText = `${pgError.detail || ''} ${pgError.constraint || ''}`.toLowerCase();

  return (
    pgError.code === '23505' &&
    detailText.includes('phone') &&
    detailText.includes(USERS_PHONE_UNIQUE_INDEX)
  );
};

const clearLegacyDuplicatePhones = async (): Promise<number> => {
  const result = await pool.query(
    `WITH ranked_users AS (
      SELECT
        id,
        phone,
        ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC, id ASC) AS row_rank
      FROM users
      WHERE phone IS NOT NULL AND phone <> ''
    ),
    duplicates AS (
      SELECT id
      FROM ranked_users
      WHERE row_rank > 1
    )
    UPDATE users
    SET phone = NULL, updated_at = NOW()
    WHERE id IN (SELECT id FROM duplicates)
    RETURNING id`
  );

  return result.rowCount || 0;
};

export const ensureAppSchema = async () => {
  for (const statement of schemaStatements) {
    try {
      await pool.query(statement);
    } catch (error) {
      if (!isPhoneUniqueIndexCreationFailure(error)) {
        throw error;
      }

      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Failed to create ${USERS_PHONE_UNIQUE_INDEX}: existing duplicate phone values must be cleaned up before startup in production.`
        );
      }

      const cleanedRows = await clearLegacyDuplicatePhones();
      if (cleanedRows === 0) {
        throw error;
      }

      console.warn(
        `[schemaBootstrap] Cleared ${cleanedRows} legacy duplicate phone value(s); retrying ${USERS_PHONE_UNIQUE_INDEX} creation.`
      );
      await pool.query(statement);
    }
  }
};

export default ensureAppSchema;
