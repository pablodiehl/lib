# Azion Lib

The Azion Libraries provide a suite of tools to interact with various Azion services, including Products (Purge, SQL, Storage) and Utilities (WASM Image Processor, Cookies). Each library is configurable and supports debug mode and environment variable-based configuration.

These libraries are designed to be versatile and can be used both within and outside of the Azion Runtime environment. When used outside of the Azion Runtime, the libraries will interact with Azion services via REST APIs. However, when used within the `Azion Runtime`, the libraries will leverage internal runtime capabilities for enhanced performance and efficiency.

## Table of Contents

- [Installation](#installation)
- [Products](#products)
  - [Client](#client)
  - [Storage](#storage)
  - [SQL](#sql)
  - [Purge](#purge)
- [Utilities](#utilities)
  - [Cookies](#cookies)
  - [WASM Image Processor](#wasm-image-processor)
- [Contributing](#contributing)

## Installation

Install the package using npm or yarn:

```sh
npm install azion
```

or

```sh
yarn add azion
```

## Products

### Client

The Azion Client provides a unified interface to interact with all Azion services.

#### Examples

**JavaScript:**

```javascript
import { createClient } from 'azion';

const client = createClient({ token: 'your-api-token', debug: true });

// Storage
const newBucket = await client.storage.createBucket('my-new-bucket', 'public');
console.log(`Bucket created with name: ${newBucket.name}`);

const allBuckets = await client.storage.getBuckets();
console.log(`Retrieved ${allBuckets.length} buckets`);

// SQL
const newDatabase = await client.sql.createDatabase('my-new-db');
console.log(`Database created with ID: ${newDatabase.id}`);

const allDatabases = await client.sql.getDatabases();
console.log(`Retrieved ${allDatabases.length} databases`);

// Purge
const purgeResult = await client.purge.purgeURL(['http://example.com/image.jpg']);
console.log(`Purge successful: ${purgeResult.items}`);
```

**TypeScript:**

```typescript
import { createClient } from 'azion';
import { AzionClient, Bucket, Database, Purge } from 'azion/types';

const client: AzionClient = createClient({ token: 'your-api-token', debug: true });

// Storage
const newBucket: Bucket | null = await client.storage.createBucket('my-new-bucket', 'public');
console.log(`Bucket created with name: ${newBucket.name}`);

const allBuckets: Bucket[] | null = await client.storage.getBuckets();
console.log(`Retrieved ${allBuckets.length} buckets`);

// SQL
const newDatabase: Database | null = await client.sql.createDatabase('my-new-db');
console.log(`Database created with ID: ${newDatabase.id}`);

const allDatabases: Database[] | null = await client.sql.getDatabases();
console.log(`Retrieved ${allDatabases.length} databases`);

// Purge
const purgeResult: Purge | null = await client.purge.purgeURL(['http://example.com/image.jpg']);
console.log(`Purge successful: ${purgeResult.items}`);
```

### Storage

The Storage library provides methods to interact with Azion Edge Storage.

#### Examples

**JavaScript:**

```javascript
import { createClient } from 'azion/storage';

const client = createClient({ token: 'your-api-token', debug: true });

const newBucket = await client.createBucket('my-new-bucket', 'public');
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion/storage';
import { StorageClient, Bucket } from 'azion/storage/types';

const client: StorageClient = createClient({ token: 'your-api-token', debug: true });

const newBucket: Bucket | null = await client.createBucket('my-new-bucket', 'public');
if (newBucket) {
  console.log(`Bucket created with name: ${newBucket.name}`);
}

const allBuckets: Bucket[] | null = await client.getBuckets();
if (allBuckets) {
  console.log(`Retrieved ${allBuckets.length} buckets`);
}
```

Read more in the [Storage README](./packages/storage/README.md).

### SQL

The SQL library provides methods to interact with Azion Edge SQL databases.

#### Examples

**JavaScript:**

```javascript
import { createClient } from 'azion/sql';

const client = createClient({ token: 'your-api-token', debug: true });

const newDatabase = await client.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
}

const allDatabases = await client.getDatabases();
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.length} databases`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion/sql';
import { SQLClient, Database } from 'azion/sql/types';

const client: SQLClient = createClient({ token: 'your-api-token', debug: true });

const newDatabase: Database | null = await client.createDatabase('my-new-db');
if (newDatabase) {
  console.log(`Database created with ID: ${newDatabase.id}`);
}

const allDatabases: Database[] | null = await client.getDatabases();
if (allDatabases) {
  console.log(`Retrieved ${allDatabases.length} databases`);
}
```

Read more in the [SQL README](./packages/sql/README.MD).

### Purge

The Purge library provides methods to purge URLs, Cache Keys, and Wildcard expressions from the Azion Edge cache.

#### Examples

**JavaScript:**

```javascript
import { createClient } from 'azion/purge';

const client = createClient({ token: 'your-api-token', debug: true });

const purgeResult = await client.purgeURL(['http://example.com/image.jpg']);
if (purgeResult) {
  console.log(`Purge successful: ${purgeResult.items}`);
}

const cacheKeyResult = await client.purgeCacheKey(['my-cache-key-1', 'my-cache-key-2']);
if (cacheKeyResult) {
  console.log(`Cache key purge successful: ${cacheKeyResult.items}`);
}
```

**TypeScript:**

```typescript
import { createClient } from 'azion/purge';
import { PurgeClient, Purge } from 'azion/purge/types';

const client: PurgeClient = createClient({ token: 'your-api-token', debug: true });

const purgeResult: Purge | null = await client.purgeURL(['http://example.com/image.jpg']);
if (purgeResult) {
  console.log(`Purge successful: ${purgeResult.items}`);
}

const cacheKeyResult: Purge | null = await client.purgeCacheKey(['my-cache-key-1', 'my-cache-key-2']);
if (cacheKeyResult) {
  console.log(`Cache key purge successful: ${cacheKeyResult.items}`);
}
```

Read more in the [Purge README](./packages/purge/README.md).

## Utilities

### Cookies

The Cookies library provides methods to get and set cookies.

#### Examples

**JavaScript:**

```javascript
import { getCookie, setCookie } from 'azion/cookies';

const myCookie = getCookie(request, 'my-cookie');
setCookie(response, 'my-cookie', 'cookie-value', { maxAge: 3600 });
```

**TypeScript:**

```typescript
import { getCookie, setCookie } from 'azion/cookies';
import { CookieOptions } from 'azion/cookies/types';

const myCookie: string | undefined = getCookie(request, 'my-cookie');
const options: CookieOptions = { maxAge: 3600 };
setCookie(response, 'my-cookie', 'cookie-value', options);
```

Read more in the [Cookies README](./packages/cookies/README.md).

### WASM Image Processor

The WASM Image Processor library provides methods to process images using WebAssembly.

#### Examples

**JavaScript:**

```javascript
import { loadImage } from 'azion/wasm-image-processor';

const image = await loadImage('https://example.com/image.jpg');
image.resize(0.5, 0.5);
const image = image.getImageResponse('jpeg');
console.log(imageResponse);
```

**TypeScript:**

```typescript
import { loadImage } from 'azion/wasm-image-processor';
import { WasmImage } from 'azion/wasm-image-processor/types';

const image: WasmImage = await loadImage('https://example.com/image.jpg');
image.resize(0.5, 0.5);
const imageResponse = image.getImageResponse('jpeg');
console.log(imageResponse);
```

Read more in the [WASM Image Processor README](./packages/wasm-image-processor/README.md).

## Contributing

Feel free to submit issues or pull requests to improve the functionality or documentation.
