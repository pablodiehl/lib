const BASE_URL = 'https://api.azion.com/v4/storage/buckets';

const getAllBuckets = async (token: string, options?: BucketCollectionOptions, debug?: boolean): Promise<Bucket[]> => {
  try {
    const { size = 10, page = 1 } = options || {};
    const queryParams = new URLSearchParams({ page_size: String(size), page: String(page) });
    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json; version=3', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data.results;
  } catch (error) {
    if (debug) console.error('Error getting all buckets:', error);
    throw error;
  }
};

const createBucket = async (token: string, name: string, edge_access: string, debug?: boolean): Promise<Bucket> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ name, edge_access }),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data.data;
  } catch (error) {
    if (debug) console.error('Error creating bucket:', error);
    throw error;
  }
};

const patchBucket = async (token: string, name: string, edge_access: string, debug?: boolean): Promise<Bucket> => {
  try {
    const response = await fetch(`${BASE_URL}/${name}`, {
      method: 'PATCH',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ edge_access }),
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data.data;
  } catch (error) {
    if (debug) console.error('Error updating bucket:', error);
    throw error;
  }
};

const deleteBucket = async (token: string, name: string, debug?: boolean): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/${name}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    if (debug) console.log('Response:', response);
  } catch (error) {
    if (debug) console.error('Error deleting bucket:', error);
    throw error;
  }
};

const getBucketByName = async (token: string, name: string, debug?: boolean): Promise<Bucket> => {
  try {
    const response = await fetch(`${BASE_URL}/${name}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return {
      ...data.data,
      listObjects: () => getAllObjects(token, name, debug),
      uploadObject: (objectKey: string, file: string) => postObject(token, name, objectKey, file, debug),
      getObject: (objectKey: string) => getObjectByName(token, name, objectKey, debug),
      updateObject: (objectKey: string, file: string) => putObject(token, name, objectKey, file, debug),
      deleteObject: (objectKey: string) => deleteObject(token, name, objectKey, debug),
    };
  } catch (error) {
    if (debug) console.error('Error getting bucket by name:', error);
    throw error;
  }
};

const getAllObjects = async (token: string, bucketName: string, debug?: boolean): Promise<BucketObject[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data.results;
  } catch (error) {
    if (debug) console.error('Error getting all objects:', error);
    throw error;
  }
};

const postObject = async (
  token: string,
  bucketName: string,
  objectKey: string,
  file: string,
  debug?: boolean,
): Promise<BucketObject> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects/${objectKey}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/octet-stream',
        Authorization: `Token ${token}`,
      },
      body: file,
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data.data;
  } catch (error) {
    if (debug) console.error('Error posting object:', error);
    throw error;
  }
};

const getObjectByName = async (
  token: string,
  bucketName: string,
  objectKey: string,
  debug?: boolean,
): Promise<BucketObject> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects/${objectKey}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    const data = await response.text();
    if (debug) console.log('Response:', data);
    return { key: objectKey, content: data };
  } catch (error) {
    if (debug) console.error('Error getting object by name:', error);
    throw error;
  }
};

const putObject = async (
  token: string,
  bucketName: string,
  objectKey: string,
  file: string,
  debug?: boolean,
): Promise<BucketObject> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects/${objectKey}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/octet-stream',
        Authorization: `Token ${token}`,
      },
      body: file,
    });
    const data = await response.json();
    if (debug) console.log('Response:', data);
    return data.data;
  } catch (error) {
    if (debug) console.error('Error putting object:', error);
    throw error;
  }
};

const deleteObject = async (token: string, bucketName: string, objectKey: string, debug?: boolean): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/${bucketName}/objects/${objectKey}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Token ${token}` },
    });
    if (debug) console.log('Response:', response);
  } catch (error) {
    if (debug) console.error('Error deleting object:', error);
    throw error;
  }
};
export {
  createBucket,
  deleteBucket,
  deleteObject,
  getAllBuckets,
  getAllObjects,
  getBucketByName,
  getObjectByName,
  patchBucket,
  postObject,
  putObject,
};
