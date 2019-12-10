class OperationQueue {
  constructor(db) {
    this.db = db;
    this.type = 'operationQueue';
  }

  async getQueue() {
    const queueObj = await this.db.read(this.type);
    return (queueObj && queueObj.queue) || [];
  }

  /**
   * Places an operation at the tail of the queue.
   * If there is already an operation for the same DID, Sidetree Error is thrown with 'code': 'batch_writer_already_has_operation_for_did'.
   */
  async enqueue(didUniqueSuffix, operationBuffer) {
    const queue = await this.getQueue();
    await this.db.write(this.type, {
      queue: [...queue, operationBuffer],
    });
    return true;
  }

  /**
   * Removes the given count of operation buffers from the beginning of the queue.
   */
  async dequeue(count) {
    const queue = await this.getQueue();
    const toDequeue = queue.slice(0, count);
    const remaining = queue.slice(count);
    console.log(remaining);
    return toDequeue;
  }

  /**
   * Fetches the given count of operation buffers from the beginning of the queue without removing them.
   */
  async peek(count) {
    const queue = await this.getQueue();
    return queue.slice(0, count);
  }

  /**
   * Checks to see if the queue already contains an operation for the given DID unique suffix.
   */
  contains(didUniqueSuffix) {}
}

module.exports = OperationQueue;
