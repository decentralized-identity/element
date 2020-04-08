const {
  getTestSideTree,
  getCreatePayloadForKeyIndex,
} = require('../../__tests__/test-utils');
const OperationQueue = require('./operationQueue');
const { MnemonicKeySystem } = require('../../../index');
const { getDidUniqueSuffix } = require('../../func');

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
    createPayload1 = await getCreatePayloadForKeyIndex(sidetree, mks, 0);
    createPayload2 = await getCreatePayloadForKeyIndex(sidetree, mks, 1);
    createPayload3 = await getCreatePayloadForKeyIndex(sidetree, mks, 2);
    didUniqueSuffix1 = getDidUniqueSuffix(createPayload1);
    didUniqueSuffix2 = getDidUniqueSuffix(createPayload2);
    didUniqueSuffix3 = getDidUniqueSuffix(createPayload3);
  });

  it('should queue operations', async () => {
    expect(
      await operationQueue.enqueue(didUniqueSuffix1, createPayload1)
    ).toBeTruthy();
    expect(
      await operationQueue.enqueue(didUniqueSuffix2, createPayload2)
    ).toBeTruthy();
    expect(
      await operationQueue.enqueue(didUniqueSuffix3, createPayload3)
    ).toBeTruthy();
  });

  it('should peek the operations in the right order', async () => {
    // Peek the first operation of the queue
    let operations = await operationQueue.peek(1);
    expect(operations).toHaveLength(1);
    expect(operations[0]).toEqual(createPayload1);
    // Peek the first two operations of the queue
    operations = await operationQueue.peek(2);
    expect(operations).toHaveLength(2);
    expect(operations[0]).toEqual(createPayload1);
    expect(operations[1]).toEqual(createPayload2);
    // Peek the first three operations of the queue
    operations = await operationQueue.peek(3);
    expect(operations).toHaveLength(3);
    expect(operations[0]).toEqual(createPayload1);
    expect(operations[1]).toEqual(createPayload2);
    expect(operations[2]).toEqual(createPayload3);
    // Peek more operations than the queue contains
    operations = await operationQueue.peek(4);
    expect(operations).toHaveLength(3);
    expect(operations[0]).toEqual(createPayload1);
    expect(operations[1]).toEqual(createPayload2);
    expect(operations[2]).toEqual(createPayload3);
  });

  it('should dequeue the operations in the right order', async () => {
    // Dequeue the first operation of the queue
    let operations = await operationQueue.dequeue(1);
    expect(operations).toHaveLength(1);
    expect(operations[0]).toEqual(createPayload1);
    // Dequeue two more operations
    operations = await operationQueue.dequeue(2);
    expect(operations).toHaveLength(2);
    expect(operations[0]).toEqual(createPayload2);
    expect(operations[1]).toEqual(createPayload3);
    // Dequeue when there is nothing more to dequeue
    operations = await operationQueue.dequeue(1);
    expect(operations).toHaveLength(0);
    operations = await operationQueue.dequeue(2);
    expect(operations).toHaveLength(0);
  });

  it('should say if the queue contains a given operation', async () => {
    await operationQueue.enqueue(didUniqueSuffix1, createPayload1);
    await operationQueue.enqueue(didUniqueSuffix2, createPayload2);
    expect(await operationQueue.contains(didUniqueSuffix1)).toBeTruthy();
    expect(await operationQueue.contains(didUniqueSuffix2)).toBeTruthy();
    expect(await operationQueue.contains(didUniqueSuffix3)).not.toBeTruthy();
  });

  it('should throw if already an operation in the queue for this did', () => {
    const errorMessage = 'there already is an operation for the did';
    return expect(
      operationQueue.enqueue(didUniqueSuffix1, createPayload1)
    ).rejects.toMatchObject(Error(errorMessage));
  });
});
