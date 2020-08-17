const Migrations = artifacts.require("testElement");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};