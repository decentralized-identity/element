const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

class ElementFirestoreAdapter {
  constructor({ name, firebaseAppConfig }) {
    this.dbName = name;
    firebase.initializeApp(firebaseAppConfig);
    this.db = firebase.firestore();
  }

  signInAnonymously() {
    return firebase.auth().signInAnonymously();
  }

  async write(id, data) {
    const result = await this.db
      .collection("element-adapter")
      .doc(id)
      .set(data);
    return {
      id
    };
  }

  async read(id) {
    return this.db
      .collection("element-adapter")
      .doc(id)
      .get()
      .then(doc => {
        return doc.data();
      });
  }

  async readCollection(type) {
    let querySnapshot = await this.db
      .collection("element-adapter")
      .where("type", "==", type)
      .get();
    let res = [];
    querySnapshot.forEach(doc => {
      res.push(doc.data());
    });
    return res;
  }

  async deleteDB() {
    const querySnapshot = await this.db.collection("element-adapter").get();
    return Promise.all(
      querySnapshot.docs.map(doc => {
        return this.db
          .collection("element-adapter")
          .doc(doc.id)
          .delete();
      })
    );
  }

  async close() {
    firebase.app("[DEFAULT]").delete();
  }
}

module.exports = ElementFirestoreAdapter;
