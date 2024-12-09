
const mongoose = require('mongoose');
const Campground = require('../models/campground');

const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const { authorize } = require('passport');

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp').then(() => { console.log("Mongo Connection Open!!!") }).catch(error => {
  console.log("Mongo Connection Error !!!");
  console.log("connection error", error)
});
const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;

    const camp = new Campground({
      author: '64c0c3d5429ecf1c1865a530',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dtyykfjgk/image/upload/v1690705698/yelpCamp/xdvjf9qcgnccedqy83uv.webp',
          filename: 'yelpCamp/xdvjf9qcgnccedqy83uv'
        },
        {
          url:'https://res.cloudinary.com/dtyykfjgk/image/uploadfnummludge8rl.webp',
          filename:'yelpCamp/h9ijoqlfnummludge8rl'

        },
        {
          url: 'https://res.cloudinary.com/dtyykfjgk/image/uploadgcuykvsquxp49.webp',
          filename:  'yelpCamp/ku6wwnvgcuykvsquxp49',

        }
      ]
      ,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
      price
    })
    await camp.save();
  }
}
seedDB().then(() => {
  mongoose.connection.close();
});