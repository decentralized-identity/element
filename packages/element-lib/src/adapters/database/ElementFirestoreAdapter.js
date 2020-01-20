class ElementFirestoreAdapter {
  constructor({ firestore }) {
    this.db = firestore;
  }

  async write(id, data) {
    await this.db
      .collection('element-adapter')
      .doc(id)
      .set(data);
    return {
      id,
    };
  }

  async read(id) {
    return this.db
      .collection('element-adapter')
      .doc(id)
      .get()
      .then(doc => doc.data());
  }

  async readCollection(type) {
    const querySnapshot = await this.db
      .collection('element-adapter')
      .where('type', '==', type)
      .get();
    const res = [];
    querySnapshot.forEach(doc => {
      res.push(doc.data());
    });
    return res;
  }

  async deleteDB() {
    const querySnapshot = await this.db.collection('element-adapter').get();
    return Promise.all(
      querySnapshot.docs.map(doc =>
        this.db
          .collection('element-adapter')
          .doc(doc.id)
          .delete()
      )
    );
  }
}

module.exports = ElementFirestoreAdapter;
