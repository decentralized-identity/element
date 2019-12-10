class OperationQueue {
  constructor(db) {
    this.db = db;
    this.type = 'operationQueue';
  }

  /**
   * Places an operation at the tail of the queue.
   * If there is already an operation for the same DID, Sidetree Error is thrown with 'code': 'batch_writer_already_has_operation_for_did'.
   */
  async enqueue(didUniqueSuffix, operationBuffer) {
    await this.db.write(`${this.type}${didUniqueSuffix}`, {
      type: this.type,
      time: Date.now(),
      operationBuffer,
    });
    return true;
  }

  /**
   * Removes the given count of operation buffers from the beginning of the queue.
   */
  dequeue(count) {
  }

  /**
   * Fetches the given count of operation buffers from the beginning of the queue without removing them.
   */
  async peek(count) {
    const operations = await this.db.readCollection(this.type);
    operations.sort((o1, o2) => o1.time - o2.time);
    return operations.slice(0, count);
  }

  /**
   * Checks to see if the queue already contains an operation for the given DID unique suffix.
   */
  contains(didUniqueSuffix) {}
}

module.exports = OperationQueue;
