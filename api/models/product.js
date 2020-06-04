const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ImageId: mongoose.Schema.Types.ObjectId,
    filename: { type: String}, 
    name: { type: String, required: true },
    price: { type: Number, required: true },
    email: { 
        type: String, 
    
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    
  


});

module.exports = mongoose.model('Newproduct', productSchema);