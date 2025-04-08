const PetitionSystem = require('./web3Interface');


const Petition = require("./models/petition")
const Signature = require("./models/signature")

class BlockchainDBBridge {
    constructor() {
        this.petitionSystem = new PetitionSystem();
        this.initialized = false;
    }

    async init(){
        const conn = await this.petitionSystem.init();

        if(conn.success){
            this.initialized = true;
            return { success: true };
        }
        return { success: false, message: conn.message };
    }

  // Create petition on blockchain and store additional data in MongoDB
    async createPetition(petitionData) {
        if (!this.initialized) await this.init();

        // Create petition on blockchain
        const result = await this.petitionSystem.createPetition(
            petitionData.title,
            petitionData.description,
            petitionData.fromAddress
        );

        if (result.success) {
        try {
            // Get petition details from blockchain
            const blockchainPetition = await this.petitionSystem.getPetition(result.petitionId);
            
            // Store in MongoDB with additional data
            const petition = new Petition({
                blockchainId: result.petitionId,
                title: petitionData.title,
                description: petitionData.description,
                creator: blockchainPetition.petition.creator,
                category: petitionData.category || 'Uncategorized',
                governmentLevel: petitionData.governmentLevel || 'Local',
                priority: petitionData.priority || 'Medium',
                userId: petitionData.userId,
                aiSummary: petitionData.aiSummary || 'Will take some time. Please, wait.',
                attachments: petitionData.attachments,
            });

            await petition.save();
            
            return {
                success: true,
                petitionId: result.petitionId,
                message: 'Petition created on blockchain and stored in MongoDB'
            };
        } catch (error) {
            return {
                success: false,
                message: `Blockchain transaction succeeded but MongoDB storage failed: ${error.message}`,
                petitionId: result.petitionId
            };
        }
        } else {
            return result; // Return blockchain error
        }
    }
    
    // Sign petition on blockchain and store additional data in MongoDB
  async signPetition(signatureData) {
    if (!this.initialized) await this.init();

    // Sign on blockchain
    const result = await this.petitionSystem.signPetition(
      signatureData.petitionId,
      signatureData.name,
      signatureData.email
    );

    if (result.success) {
      try {
        // Get signature count to determine signature ID
        const signaturesResult = await this.petitionSystem.getAllSignatures(signatureData.petitionId);
        const signatureId = signaturesResult.count - 1;
        
        // Get the specific signature
        const blockchainSignature = signaturesResult.signatures[signatureId];

        // Store in MongoDB with additional data
        const signature = new Signature({
          petitionId: signatureData.petitionId,
          signatureId: signatureId,
          signer: blockchainSignature.signer,
          name: blockchainSignature.name,
          timestamp: blockchainSignature.timestamp,
          email: signatureData.email,
        });

        await signature.save();
        
        return {
          success: true,
          message: 'Signature added on blockchain and stored in MongoDB',
          signatureId
        };
      } catch (error) {
        return {
          success: false,
          message: `Blockchain transaction succeeded but MongoDB storage failed: ${error.message}`
        };
      }
    } else {
      return result; // Return blockchain error
    }
  }
}

module.exports = BlockchainDBBridge;