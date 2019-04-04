const firebaseStorage = require('../storage/firebaseStorage');
const mockStorage = require('../storage/mockStorage');

let storage = firebaseStorage;

if (process.env.NODE_ENV === 'testing') {
  storage = mockStorage;
}

module.exports = storage;
