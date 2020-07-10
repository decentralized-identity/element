/* eslint-disable global-require */
const keys = {
  'did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs': require('./keys/key.json'),
};

const didDocs = {
  'did:key:z6Mkozt95WhH9chvYaPTTsd1FzMbXc1cuvo1hfiZodGNd9Gs': require('./didDocs/key.json'),
  'did:work:2UUHQCd4psvkPLZGnWY33L': require('./didDocs/work.json'),
  'did:github:OR13': require('./didDocs/github.json'),
};

module.exports = {
  keys,
  didDocs,
};
