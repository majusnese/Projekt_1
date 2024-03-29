import mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    locations: {
        type: Number,
        min: [0, 'At least one salespoint'],
        required: true,
    },
    headquarter: {
        type: String,
        required: true,
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
    },
});

const seller = mongoose.model('Seller', sellerSchema);

export default seller;
