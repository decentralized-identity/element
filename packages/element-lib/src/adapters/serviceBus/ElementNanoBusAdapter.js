const nanobus = require('nanobus');

class ElementNanoBusAdapter {
  constructor() {
    this.serviceBus = nanobus();
  }

  emit(id, data) {
    return this.serviceBus.emit(id, data);
  }

  on(id, callback) {
    return this.serviceBus.on(id, callback);
  }

  close() {
    return this.serviceBus.removeAllListeners();
  }
}

module.exports = ElementNanoBusAdapter;
