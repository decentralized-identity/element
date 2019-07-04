const faker = require('faker');
const element = require('@transmute/element-lib');

const generateActors = (count) => {
  const actors = [];
  let i = 0;

  while (i < count) {
    const mks = new element.MnemonicKeySystem(element.MnemonicKeySystem.generateMnemonic());
    const didUniqueSuffix = element.op.getDidUniqueSuffix({
      primaryKey: mks.getKeyForPurpose('primary', 0),
      recoveryPublicKey: mks.getKeyForPurpose('recovery', 0).publicKey,
    });
    const actor = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      did: `did:elem:${didUniqueSuffix}`,
      name: faker.name.findName(),
      email: faker.internet.email(),
      jobTitle: faker.name.jobTitle(),
      sameAs: [
        `https://www.facebook.com/${i}`,
        `https://www.linkedin.com/${i}`,
        `https://did.example.com/did:elem:${didUniqueSuffix}`,
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
};
