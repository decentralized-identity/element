/* eslint-disable global-require */
const keys = {
  'did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs': require('./keys/did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs.json'),
};

const didDocs = {
  'did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs': require('./didDocs/did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs.json'),
  'did:work:2UUHQCd4psvkPLZGnWY33L': require('./didDocs/did:work:2UUHQCd4psvkPLZGnWY33L.json'),
  'did:github:OR13': require('./didDocs/did:github:OR13.json'),
};

module.exports = {
  keys,
  didDocs,
};
