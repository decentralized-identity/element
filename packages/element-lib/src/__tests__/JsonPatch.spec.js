const { applyReducer } = require('fast-json-patch');

// https://github.com/Starcounter-Jack/JSON-Patch
describe('Json Patch', () => {
  it('apply patch reducer', async () => {
    const document = {
      firstName: 'Albert',
      contactDetails: { phoneNumbers: [] },
    };
    const patch = [
      { op: 'replace', path: '/firstName', value: 'Joachim' },
      { op: 'add', path: '/lastName', value: 'Wester' },
      {
        op: 'add',
        path: '/contactDetails/phoneNumbers/0',
        value: { number: '555-123' },
      },
    ];
    const updatedDocument = patch.reduce(applyReducer, document);
    expect(updatedDocument.firstName).toBe('Joachim');
  });
});
