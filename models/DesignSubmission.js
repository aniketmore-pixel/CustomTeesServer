// models/DesignSubmission.js
const mongoose = require('mongoose');

// Optional: Email regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DesignSubmissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  design: { type: String, required: true }, // URL of the uploaded image
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    validate: {
      validator: (v) => emailRegex.test(v), // Validate email format
      message: props => `${props.value} is not a valid email!`
    },
    unique: true // Optional: enforce unique email addresses
  },
  phone: { 
    type: String, 
    required: true, 
    validate: {
      validator: (v) => v.length >= 10, // Example validation: phone number must be at least 10 digits
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  margin: { 
    type: Number, 
    required: true,
    min: 0 // Optional: enforce a minimum margin value
  },
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

const DesignSubmission = mongoose.model('DesignSubmission', DesignSubmissionSchema);
module.exports = DesignSubmission;
