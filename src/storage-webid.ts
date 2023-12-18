import {QueryEngine} from "@comunica/query-sparql-solid";

const engine = new QueryEngine();

export async function findStorageRoot(webId: string, _fetch = fetch): Promise<string | undefined> {
  let url = webId;
  let storageRoot;
  while (!storageRoot) {
    // Check the Link headers first.
    const response = await _fetch(url, {method: 'HEAD'});
    if (response.ok) {
      const linkHeader = response.headers.get('Link');
      if (linkHeader) {
        const links = parseLinkHeader(linkHeader);
        // Check if the Link header contains a "type" link with value "http://www.w3.org/ns/pim/space#Storage".
        if (links.type && links.type.target === 'http://www.w3.org/ns/pim/space#Storage') {
          storageRoot = url;
        }
        // Check if the Link header contains a reference to the storage.
        else if (links['http://www.w3.org/ns/pim/space#storage']) {
          storageRoot = links['http://www.w3.org/ns/pim/space#storage'].target;
        }
        // Check if the Link header contains a reference to the storage description.
        else if (links['http://www.w3.org/ns/solid/terms#storageDescription']) {
          // Query the storage description to find the storage.
          const storageDescription = links['http://www.w3.org/ns/solid/terms#storageDescription'].target;
          const query = `SELECT ?storage WHERE { ?storage a <http://www.w3.org/ns/pim/space#Storage> . }`;
          const bindings = await (await engine.queryBindings(query, {
            sources: [storageDescription],
            fetch: _fetch
          })).toArray();
          storageRoot = bindings[0]?.get('storage')?.value;
        }
      }
      // Check if the document contains a reference to the storage.
      if (!storageRoot) {
        const query = `SELECT ?storage WHERE { <${webId}> <http://www.w3.org/ns/pim/space#storage> ?storage . }`;
        const bindings = await (await engine.queryBindings(query, {sources: [url], fetch: _fetch})).toArray();
        storageRoot = bindings[0]?.get('storage')?.value;
      }
    }
    // If storageRoot is still undefined, we traverse upwards.
    if (!storageRoot) {
      url = url.substring(0, url.lastIndexOf('/', url.length - 2)) + '/';

      // Check we went past the root.
      if (url === 'https://' || url === 'http://') {
        return undefined;
      }
    }
  }

  return storageRoot;
}

function parseLinkHeader(header: string): { [rel: string]: { target: string } } {
  const links: { [rel: string]: { target: string } } = {};
  const parts = header.split(',');
  for (const part of parts) {
    const section = part.split(';');
    if (section.length < 2) {
      continue;
    }
    const url = section[0].replace(/<(.*)>/, '$1').trim();
    const rel = section[1].replace(/rel="(.*?)"/, '$1').trim();
    links[rel] = {target: url};
  }
  return links;
}
