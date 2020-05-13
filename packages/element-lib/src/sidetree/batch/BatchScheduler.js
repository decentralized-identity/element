const { getDidUniqueSuffix } = require('../../func');

class BatchScheduler {
  constructor(sidetree) {
    /**
     * Denotes if the periodic batch writing should continue to occur.
     */
    this.continuePeriodicBatchWriting = false;
    this.sidetree = sidetree;
  }

  /**
   * The function that starts periodically anchoring operation batches to blockchain.
   */
  startPeriodicBatchWriting() {
    this.continuePeriodicBatchWriting = true;
    setImmediate(async () => this.writeOperationBatch());
  }

  /**
   * Stops periodic batch writing.
   * Mainly used for test purposes.
   */
  stopPeriodicBatchWriting() {
    this.sidetree.logger.info('Stopped periodic batch writing.');
    this.continuePeriodicBatchWriting = false;
  }

  /**
   * Processes the operations in the queue.
   */
  async writeOperationBatch() {
    const start = Date.now(); // For calculating time taken to write operations.
    const {
      batchingIntervalInSeconds,
      maxOperationsPerBatch,
    } = this.sidetree.parameters;
    const operationCount = (await this.sidetree.operationQueue.peek(
      maxOperationsPerBatch
    )).length;

    try {
      this.sidetree.logger.info('Start batch writing...');
      await this.sidetree.batchWrite();
    } catch (error) {
      this.sidetree.logger.error(
        'Unexpected and unhandled error during batch writing, investigate and fix:'
      );
      this.sidetree.logger.error(error.message);
    } finally {
      const end = Date.now();
      this.sidetree.logger.info(
        `End batch writing of ${operationCount} operations. Duration: ${(end -
          start) /
          1000} ms.`
      );

      if (this.continuePeriodicBatchWriting) {
        this.sidetree.logger.info(
          `Waiting for ${batchingIntervalInSeconds} seconds before writing another batch.`
        );
        setTimeout(
          async () => this.writeOperationBatch(),
          batchingIntervalInSeconds * 1000
        );
      }
    }
  }

  /**
   * Processes a batch of operations now
   * Mainly used for test purposes.
   */
  async writeNow(payload) {
    const didUniqueSuffix = getDidUniqueSuffix(payload);
    try {
      await this.sidetree.operationQueue.enqueue(didUniqueSuffix, payload);
    } catch (e) {
      this.sidetree.logger.error(e);
    }
    return this.sidetree.batchWrite();
  }
}

module.exports = BatchScheduler;
