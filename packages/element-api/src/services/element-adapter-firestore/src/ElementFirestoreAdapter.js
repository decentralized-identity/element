class ElementFirestoreAdapter {
  constructor({ name, firebaseAdmin }) {
    this.dbName = name;
    this.firebase = firebaseAdmin;
    this.db = firebaseAdmin.firestore();
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
    querySnapshot.forEach((doc) => {
      res.push(doc.data());
    });
    return res;
  }

  async deleteDB() {
    const querySnapshot = await this.db.collection('element-adapter').get();
    return Promise.all(
      querySnapshot.docs.map(doc => this.db
        .collection('element-adapter')
        .doc(doc.id)
        .delete()),
    );
  }

  async close() {
    this.firebase.app('[DEFAULT]').delete();
  }
}

module.exports = ElementFirestoreAdapter;
