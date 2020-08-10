const Migrations = artifacts.require("ElementOperatorRegistryStaking");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
