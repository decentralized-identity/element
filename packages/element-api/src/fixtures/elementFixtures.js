// eslint-disable-next-line
const faker = require('faker');
const { Sidetree, func, MnemonicKeySystem } = require('@transmute/element-lib');

const getTestSidetree = () => {
  return new Sidetree({
    parameters: {
      didMethodName: 'did:elem:ropsten',
    },
  });
};

const generateActors = (sidetree, count) => {
  const actors = [];
  let i = 0;

  while (i < count) {
    const mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    const primaryKey = mks.getKeyForPurpose('primary', 0);
    const recoveryKey = mks.getKeyForPurpose('recovery', 0);
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );

    const createPayload = sidetree.op.getCreatePayload(
      didDocumentModel,
      primaryKey
    );
    const didUniqueSuffix = func.getDidUniqueSuffix(createPayload);
    const actor = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      did: `did:elem:ropsten:${didUniqueSuffix}`,
      name: faker.name.findName(),
      email: faker.internet.email(),
      jobTitle: faker.name.jobTitle(),
      sameAs: [
        `https://www.facebook.com/${i}`,
        `https://www.linkedin.com/${i}`,
        `https://did.example.com/did:elem:ropsten:${didUniqueSuffix}`,
      ],
      mks,
      didUniqueSuffix,
    };
    i += 1;
    actors.push(actor);
  }
  return actors;
};

module.exports = {
  generateActors,
  getTestSidetree,
};
