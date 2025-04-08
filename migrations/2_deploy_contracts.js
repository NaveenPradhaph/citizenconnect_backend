const PetitionManagement = artifacts.require("PetitionManagement");

module.exports = function(deployer) {
  deployer.deploy(PetitionManagement);
};