import mongoose = require('mongoose');
import {regex} from '../utils/Validator'
const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: regex
    },
    password: { 
        type: String, required: true            
    }
});

const user = mongoose.model('User', userSchema);

export default user;