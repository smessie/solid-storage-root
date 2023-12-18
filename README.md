# solid-storage-root

This is a library that helps you find the storage root of a Solid pod of a given Web ID.

## Installation

```bash
npm install solid-storage-root
```

## Usage

```javascript
import {findStorageRoot} from 'solid-storage-root';

const storageRoot = await findStorageRoot('https://solid.pod/profile/card#me');
```

You can additionally pass a fetch function as a second argument to `findStorageRoot` to use a custom (authenticated)
fetch function:

```javascript
import {findStorageRoot} from 'solid-storage-root';

const storageRoot = await findStorageRoot('https://solid.pod/profile/card#me', fetch);
```

## Development

```bash
# Clone the repository
git clone git@github.com:smessie/solid-storage-root.git
cd solid-storage-root

# Install dependencies
npm install

# Build the library
npm run build
```
