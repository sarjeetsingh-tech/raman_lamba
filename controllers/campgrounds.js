const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.mapboxToken;
const geocoder = mbxGeocoding({ accessToken: mapboxToken }) //geocoder contains two method forward and reverse geocoding

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}
module.exports.showCampground = async (req, res,) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    campground.reviews.forEach(review => {
        // console.log(review.author.username);
    });
    if (!campground) {
        req.flash('error', 'Campground not found !');
        return res.redirect('/campgrounds');
    }
    //  console.log(campground);
    res.render('campgrounds/show', { campground });
    // res.send(camp);
}
module.exports.postNewCampground = async (req, res, next) => {
    // res.send(req.body);//by default it will be empty because content is not parsed so we have to use router.use(express.urlencoded({ extended: true }));
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); //although our form doent allow user to submit a empty form but some can still post using postman ..
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // console.log(geoData.body.features[0].geometry.coordinates);
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;//req.user is because of passport
    await campground.save();
    console.log(campground.images);
    req.flash('success', 'Successfully added');
    res.redirect(`/campgrounds/${campground._id}`)

}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Campground not found !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}
module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });//instead can pass req.body.campground too withoud ... and braces
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        // for (let filename of req.body.deleteImages) {
        //     await cloudinary.uploader.destroy(filename);
        // }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully Updated');
    res.redirect(`/campgrounds/${campground._id}`)

}
module.exports.destroyCampground = async (req, res) => {

    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id);
    for (let image of campground.images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}