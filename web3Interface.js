// Import libraries
const Web3 = require('web3');
const contract = require('@truffle/contract');

const PetitionManagementArtifact = require('./build/contracts/PetitionManagement.json');

class PetitionSystem {
  constructor() {
      this.web3 = null;
      this.accounts = null;
      this.contract = null;
  }

  async init() {
    try{
      // Set provider
      this.web3 = new Web3('http://127.0.0.1:7545');
      
      if (!this.web3.eth) {
        return {
          success: false,
          message: 'Failed to connect to the Ethereum provider. Ensure Ganache is running.'
        };
      }

      // Get accounts
      this.accounts = await this.web3.eth.getAccounts();

      // Set up contract
      const PetitionManagement = contract(PetitionManagementArtifact);
      PetitionManagement.setProvider(this.web3.currentProvider);
      this.contract = await PetitionManagement.deployed();

      return {
        success: true,
        message: 'Successfully connected to contract',
        accounts: this.accounts
      };

    }catch(error){
      return {
          success: false,
          message: `Failed to connect: ${error.message}`
      };
    }
  }

  async createPetition(title, description, fromAddress) {
    try {
      const result = await this.contract.createPetition(
        title,
        description,
        { from: fromAddress || this.accounts[0] }
      );
      
      // Extract petition ID from event logs
      const petitionId = result.logs[0].args.petitionId.toNumber();
      
      return {
        success: true,
        petitionId,
        transactionHash: result.tx
      };
    } catch (error) {
        return {
          success: false,
          message: `Failed to create petition: ${error.message}`
        };
    }
  }

  async signPetition(petitionId, name, fromAddress) {
    try {
      const result = await this.contract.signPetition(
        petitionId,
        name,
        { from: fromAddress || this.accounts[0] }
      );
      
      return {
        success: true,
        transactionHash: result.tx
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to sign petition: ${error.message}`
      };
    }
  }
  
  async getPetition(petitionId) {
    try {
      const petition = await this.contract.getPetition(petitionId);
      
      return {
        success: true,
        petition: {
          id: petition.id.toNumber(),
          creator: petition.creator,
          title: petition.title,
          description: petition.description,
          signatureCount: petition.signatureCount.toNumber(),
          createdAt: new Date(petition.createdAt.toNumber() * 1000),
          isActive: petition.isActive
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get petition: ${error.message}`
      };
    }
  }

  async getAllSignatures(petitionId) {
    try {
      const count = await this.contract.getSignatureCount(petitionId);
      const signatures = [];
      
      for (let i = 0; i < count; i++) {
        const signature = await this.contract.getSignature(petitionId, i);
        signatures.push({
          signer: signature.signer,
          name: signature.name,
          timestamp: new Date(signature.timestamp.toNumber() * 1000)
        });
      }
      
      return {
        success: true,
        count: count.toNumber(),
        signatures
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get signatures: ${error.message}`
      };
    }
  }   
}

module.exports = PetitionSystem;