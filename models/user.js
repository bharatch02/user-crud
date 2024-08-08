const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/testapp1", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Define User Schema
const userSchema = new mongoose.Schema({
    image: {
        type: String,
        required: false, // Optional field
        validate: {
            validator: function(v) {
                // Validate if the image URL is a valid URL
                return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/i.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure emails are unique
        validate: {
            validator: function(v) {
                // Basic email validation
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Export User Model
module.exports = mongoose.model('User', userSchema);
