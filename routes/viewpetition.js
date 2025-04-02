const express = require('express');
const mongoose = require('mongoose');
const User = require("../models/user");
const router = express.Router();

// Import the Petition model
const Petition = require('../models/petition');

// Fetch a petition by ID
router.get('/petitions/:id', async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: 'Petition not found' });
    }
    res.status(200).json(petition);
    // console.log(petition)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Handle voting on a petition
router.post('/petitions/:id/vote', async (req, res) => {
  try {
    // console.log(req);
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: 'Petition not found' });
    }

    // Check if the user has already voted (you can adjust this based on your user authentication)
    // For now, assuming a simple flag for demonstration
    const userId = req.body.userId;

    if (petition.votedUsers.includes(userId)) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Increment the votes and add the user to the list of voters
    petition.votes += 1;
    petition.votedUsers.push(userId);  // Save the user who voted

    await petition.save();

    res.status(200).json({ message: 'Vote counted', votes: petition.votes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/petitions/:id/vote', async (req, res) => {
  try {
    // console.log(req);
    const {userId} = req.query;
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: 'Petition not found' });
    }

    // Check if the user has already voted (you can adjust this based on your user authentication)
    // For now, assuming a simple flag for demonstration
    // const userId = req.body.userId;

    if (petition.votedUsers.includes(userId)) {
      return res.status(200).json({ voted: true });
    }else{
      return res.status(200).json({ voted: false });
    }

    // res.status(200).json({ message: 'Vote counted', votes: petition.votes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
