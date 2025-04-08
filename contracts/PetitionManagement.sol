// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PetitionManagement{
    struct Petition {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 signatureCount;
        uint256 createdAt;
        bool isActive;
    }

    struct Signature {
        address signer;
        string name;
        uint256 timestamp;
    }

    uint256 private petitionCounter;
    mapping(uint256 => Petition) public petitions;
    mapping(uint256 => mapping(address => bool)) public hasSigned;
    mapping(uint256 => mapping(uint256 => Signature)) public signatures;
    mapping(uint256 => uint256) public signatureCounters;

    event PetitionCreated(uint256 indexed petitionId, address indexed creator, string title);
    event PetitionSigned(uint256 indexed petitionId, address indexed signer, string name);
    event PetitionClosed(uint256 indexed petitionId, uint256 finalSignatureCount);

    modifier petitionExists(uint256 _petitionId) {
        require(petitions[_petitionId].creator != address(0), "Petition does not exist");
        _;
    }

    modifier petitionActive(uint256 _petitionId) {
        require(petitions[_petitionId].isActive, "Petition is not active");
        _;
    }
    
    modifier hasNotSigned(uint256 _petitionId) {
        require(!hasSigned[_petitionId][msg.sender], "You have already signed this petition");
        _;
    }

    function createPetition(
        string memory _title,
        string memory _description
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 petitionId = petitionCounter;
        petitionCounter++;
        
        petitions[petitionId] = Petition({
            id: petitionId,
            creator: msg.sender,
            title: _title,
            description: _description,
            signatureCount: 0,
            createdAt: block.timestamp,
            isActive: true
        });
        
        emit PetitionCreated(petitionId, msg.sender, _title);
        return petitionId;
    }

    function signPetition(
        uint256 _petitionId,
        string memory _name
    ) external 
        petitionExists(_petitionId)
        petitionActive(_petitionId)
        hasNotSigned(_petitionId)
    {
        uint256 signatureId = signatureCounters[_petitionId];
        
        signatures[_petitionId][signatureId] = Signature({
            signer: msg.sender,
            name: _name,
            timestamp: block.timestamp
        });
        
        hasSigned[_petitionId][msg.sender] = true;
        petitions[_petitionId].signatureCount++;
        signatureCounters[_petitionId]++;
        
        emit PetitionSigned(_petitionId, msg.sender, _name);

    }

    // Get petition details
    function getPetition(uint256 _petitionId) external view 
        petitionExists(_petitionId)
        returns (
            uint256 id,
            address creator,
            string memory title,
            string memory description,
            uint256 signatureCount,
            uint256 createdAt,
            bool isActive
        ) 
    {
        Petition storage petition = petitions[_petitionId];
        return (
            petition.id,
            petition.creator,
            petition.title,
            petition.description,
            petition.signatureCount,
            petition.createdAt,
            petition.isActive
        );
    }

    // Get signature details for a petition
    function getSignature(uint256 _petitionId, uint256 _signatureId) external view
        petitionExists(_petitionId)
        returns (
            address signer,
            string memory name,
            uint256 timestamp
        )
    {
        require(_signatureId < signatureCounters[_petitionId], "Signature does not exist");
        
        Signature storage signature = signatures[_petitionId][_signatureId];
        return (
            signature.signer,
            signature.name,
            signature.timestamp
        );
    }

    // Get all signatures for a petition (note: this may be expensive for large petitions)
    function getSignatureCount(uint256 _petitionId) external view
        petitionExists(_petitionId)
        returns (uint256)
    {
        return signatureCounters[_petitionId];
    }
}