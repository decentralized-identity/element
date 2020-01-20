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
   * If there is already an operation for the same DID, an Error is
   * thrown
   */
  async enqueue(didUniqueSuffix, operationBuffer) {
    const queue = await this.getQueue();
    if (queue.some(o => o.didUniqueSuffix === didUniqueSuffix)) {
      throw new Error('there already is an operation for the did');
    }
    await this.db.write(this.type, {
      queue: [
        ...queue,
        {
          didUniqueSuffix,
          operationBuffer,
        },
      ],
    });
    return true;
  }

  /**
   * Removes the given count of operation buffers from the beginning of
   * the queue.
   */
  async dequeue(count) {
    const queue = await this.getQueue();
    const toDequeue = queue.slice(0, count);
    const remaining = queue.slice(count);
    await this.db.write(this.type, {
      queue: remaining,
    });
    return toDequeue.map(o => o.operationBuffer);
  }

  /**
   * Fetches the given count of operation buffers from the beginning of
   * the queue without removing them.
   */
  async peek(count) {
    const queue = await this.getQueue();
    return queue.slice(0, count).map(o => o.operationBuffer);
  }

  /**
   * Checks to see if the queue already contains an operation for the
   * given DID unique suffix.
   */
  async contains(didUniqueSuffix) {
    const queue = await this.getQueue();
    return queue.some(o => o.didUniqueSuffix === didUniqueSuffix);
  }
}

module.exports = OperationQueue;
