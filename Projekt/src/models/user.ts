import mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String, required: true
    },
    password: { 
        type: String, required: true            
    }
});

const user = mongoose.model('User', userSchema);

export default user;