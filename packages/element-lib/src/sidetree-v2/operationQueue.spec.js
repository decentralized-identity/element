const { getTestSideTree, getCreatePayloadForKeyIndex } = require('./test-utils');
const OperationQueue = require('./operationQueue');
const { MnemonicKeySystem } = require('../../index');
const { getDidUniqueSuffix } = require('./func');

const sidetree = getTestSideTree();
const operationQueue = new OperationQueue(sidetree.db);

describe('operationQueue', () => {
  const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
  let createPayload1;
  let createPayload2;
  let createPayload3;
  let didUniqueSuffix1;
  let didUniqueSuffix2;
  let didUniqueSuffix3;

  beforeAll(async () => {
    createPayload1 = await getCreatePayloadForKeyIndex(mks, 0);
    createPayload2 = await getCreatePayloadForKeyIndex(mks, 1);
    createPayload3 = await getCreatePayloadForKeyIndex(mks, 2);
    didUniqueSuffix1 = getDidUniqueSuffix(createPayload1);
    didUniqueSuffix2 = getDidUniqueSuffix(createPayload2);
    didUniqueSuffix3 = getDidUniqueSuffix(createPayload3);
  });

  it('should queue operations', async () => {
    expect(await operationQueue.enqueue(didUniqueSuffix1, createPayload1)).toBeTruthy();
    expect(await operationQueue.enqueue(didUniqueSuffix2, createPayload2)).toBeTruthy();
    expect(await operationQueue.enqueue(didUniqueSuffix3, createPayload3)).toBeTruthy();
  });

  it('should peek the right number of operations', async () => {
    // Peek the first operation of the queue
    let operations = await operationQueue.peek(1);
    expect(operations).toHaveLength(1);
    expect(operations[0].id).toEqual(`${operationQueue.type}${didUniqueSuffix1}`);
    // Peek the first two operations of the queue
    operations = await operationQueue.peek(2);
    expect(operations).toHaveLength(2);
    expect(operations[0].id).toEqual(`${operationQueue.type}${didUniqueSuffix1}`);
    expect(operations[1].id).toEqual(`${operationQueue.type}${didUniqueSuffix2}`);
    // Peek the first three operations of the queue
    operations = await operationQueue.peek(3);
    expect(operations).toHaveLength(3);
    expect(operations[0].id).toEqual(`${operationQueue.type}${didUniqueSuffix1}`);
    expect(operations[1].id).toEqual(`${operationQueue.type}${didUniqueSuffix2}`);
    expect(operations[2].id).toEqual(`${operationQueue.type}${didUniqueSuffix3}`);
    // Peek more operations than the queue contains
    operations = await operationQueue.peek(4);
    expect(operations).toHaveLength(3);
    expect(operations[0].id).toEqual(`${operationQueue.type}${didUniqueSuffix1}`);
    expect(operations[1].id).toEqual(`${operationQueue.type}${didUniqueSuffix2}`);
    expect(operations[2].id).toEqual(`${operationQueue.type}${didUniqueSuffix3}`);
  });
});
