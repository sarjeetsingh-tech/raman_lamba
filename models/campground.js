const mongoose = require("mongoose");
const schema = mongoose.Schema;


const ImageSchema = new schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_150');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    ,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]

},opts);
campgroundSchema.virtual('properties').get(function () {
    return {
      id: this._id,
      title: this.title,
      description:this.description
    }
  });

module.exports = mongoose.model('Campground', campgroundSchema); 

