/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzionDatabaseCollectionOptions, AzionEnvironment } from '../../types';
import { limitArraySize } from '../../utils';
import fetchWithErrorHandling from '../../utils/fetch';
import type {
  ApiCreateDatabaseResponse,
  ApiDeleteDatabaseResponse,
  ApiListDatabasesResponse,
  ApiQueryExecutionResponse,
} from './types';

/**
 * Gets base URL based on environment
 * @param {AzionEnvironment} env - The environment to use for the API call.
 * @returns {string} The base URL for the specified environment.
 */
const getBaseUrl = (env: AzionEnvironment = 'production'): string => {
  const urls: Record<AzionEnvironment, string> = {
    production: 'https://api.azion.com/v4/storage/buckets',
    development: '/v4/storage/buckets',
    staging: 'https://stage-api.azion.com/v4/storage/buckets',
  };
  return urls[env];
};

/**
 * Builds request headers based on token and additional headers
 * @param token Optional authentication token
 * @param additionalHeaders Additional request-specific headers
 */
const buildHeaders = (token?: string, additionalHeaders = {}) => {
  const baseHeaders = {
    Accept: 'application/json',
    ...additionalHeaders,
  };

  if (token) {
    return {
      ...baseHeaders,
      Authorization: `Token ${token}`,
    };
  }

  return baseHeaders;
};

/**
 * Builds fetch request options
 */
const buildFetchOptions = (method: string, headers: Record<string, string>, body?: string) => {
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body) {
    options.body = body;
  }

  return options;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiError = (fields: string[], data: any, operation: string) => {
  let error = { message: 'Error unknown', operation: operation };
  fields.forEach((field: string) => {
    if (data[field]) {
      const message = Array.isArray(data[field]) ? data[field].join(', ') : data[field];
      error = {
        message: message,
        operation: operation,
      };
    }
  });
  return error;
};

/**
 * Creates a new Edge Database.
 * @param {string} token - The authorization token.
 * @param {string} name - The name of the database.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {ApiCreateDatabaseResponse} The response from the API.
 */
const postEdgeDatabase = async (
  token: string,
  name: string,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiCreateDatabaseResponse> => {
  try {
    const headers = buildHeaders(token, { 'Content-Type': 'application/json' });
    const options = buildFetchOptions('POST', headers, JSON.stringify({ name }));

    const result = await fetchWithErrorHandling(getBaseUrl(env), options, debug);

    if (!result.state) {
      result.error = handleApiError(['detail'], result, 'post database');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }

    if (debug) console.log('Response Post Database', JSON.stringify(result));
    return {
      state: result.state,
      data: {
        clientId: result.data.client_id,
        createdAt: result.data.created_at,
        deletedAt: result.data.deleted_at,
        id: result.data.id,
        isActive: result.data.is_active,
        name: result.data.name,
        status: result.data.status,
        updatedAt: result.data.updated_at,
      },
    };
  } catch (error: any) {
    if (debug) console.error('Error creating EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'post database' },
    };
  }
};

/**
 * Deletes an existing Edge Database.
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to delete.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiDeleteDatabaseResponse>} The response from the API or error if an error occurs.
 */
const deleteEdgeDatabase = async (
  token: string,
  id: number,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiDeleteDatabaseResponse> => {
  try {
    const headers = buildHeaders(token);
    const options = buildFetchOptions('DELETE', headers);

    const result = await fetchWithErrorHandling(`${getBaseUrl(env)}/${id}`, options, debug);

    if (!result.state) {
      result.error = handleApiError(['detail'], result, 'delete database');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }
    return {
      state: result.state,
      data: { id },
    };
  } catch (error: any) {
    if (debug) console.error('Error deleting EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'delete database' },
    };
  }
};

/**
 * Executes a query on an Edge Database.
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to query.
 * @param {string[]} statements - The SQL statements to execute.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiQueryExecutionResponse>} The response from the API or error if an error occurs.
 */
const postQueryEdgeDatabase = async (
  token: string,
  id: number,
  statements: string[],
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiQueryExecutionResponse> => {
  try {
    const headers = buildHeaders(token, { 'Content-Type': 'application/json' });
    const options = buildFetchOptions('POST', headers, JSON.stringify({ statements }));

    const result = await fetchWithErrorHandling(`${getBaseUrl(env)}/${id}/query`, options, debug);

    if (!result.data || !Array.isArray(result.data)) {
      result.error = handleApiError(['detail'], result, 'post query');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }
    if (result.data[0].error) {
      return {
        error: {
          message: result.data[0].error,
          operation: 'post query',
        },
      };
    }

    if (debug) {
      // limit the size of the array to 10
      const limitedData: ApiQueryExecutionResponse = {
        ...result,
        data: (result as ApiQueryExecutionResponse)?.data?.map((data) => {
          return {
            ...data,
            results: {
              ...data.results,
              rows: limitArraySize(data.results.rows, 10),
            },
          };
        }),
      };
      console.log('Response Query:', JSON.stringify(limitedData));
    }
    return {
      state: result.state,
      data: result.data,
    };
  } catch (error: any) {
    if (debug) console.error('Error querying EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'post query' },
    };
  }
};

/**
 * Retrieves an Edge Database by ID.
 * @param {string} token - The authorization token.
 * @param {number} id - The ID of the database to retrieve.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiCreateDatabaseResponse>} The response from the API or error.
 */
const getEdgeDatabaseById = async (
  token: string,
  id: number,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiCreateDatabaseResponse> => {
  try {
    const result = await fetchWithErrorHandling(
      `${getBaseUrl(env)}/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        },
      },
      debug,
    );
    if (!result.data) {
      result.error = handleApiError(['detail'], result, 'get database');
      return {
        error: result.error ?? JSON.stringify(result),
      };
    }
    if (debug) console.log('Response:', result);
    return result;
  } catch (error: any) {
    if (debug) console.error('Error getting EdgeDB:', error);
    return {
      error: { message: error.toString(), operation: 'get database' },
    };
  }
};

/**
 * Retrieves a list of Edge Databases.
 * @param {string} token - The authorization token.
 * @param {Partial<AzionDatabaseCollectionOptions>} [params] - Optional query parameters.
 * @param {boolean} [debug] - Optional debug flag.
 * @returns {Promise<ApiListDatabasesResponse>} The response from the API or error.
 */
const getEdgeDatabases = async (
  token: string,
  params?: Partial<AzionDatabaseCollectionOptions>,
  debug?: boolean,
  env: AzionEnvironment = 'production',
): Promise<ApiListDatabasesResponse> => {
  try {
    const url = new URL(getBaseUrl(env));
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    const data = await fetchWithErrorHandling(
      url?.toString(),
      {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
        },
      },
      debug,
    );
    if (!data.results) {
      data.error = handleApiError(['detail'], data, 'get databases');
      return {
        error: data.error ?? JSON.stringify(data),
      };
    }
    if (debug) {
      // limit the size of the array to 10
      const limitedData = {
        ...data,
        results: limitArraySize(data.results, 10),
      };
      console.log('Response Databases:', JSON.stringify(limitedData));
    }
    return {
      links: data?.links,
      count: data.count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results: data.results.map((result: any) => ({
        clientId: result.client_id,
        createdAt: result.created_at,
        deletedAt: result.deleted_at,
        id: result.id,
        isActive: result.is_active,
        name: result.name,
        status: result.status,
        updatedAt: result.updated_at,
      })),
    };
  } catch (error: any) {
    if (debug) console.error('Error getting all EdgeDBs:', error);
    return {
      error: { message: error.toString(), operation: 'get databases' },
    };
  }
};

export { deleteEdgeDatabase, getEdgeDatabaseById, getEdgeDatabases, postEdgeDatabase, postQueryEdgeDatabase };
