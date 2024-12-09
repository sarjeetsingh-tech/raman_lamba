const express = require('express');
const router = express.Router();
const catchAsyncs = require('../utils/catchAsyncs');


const ExpressError = require('../utils/expressError');
const Campground = require('../models/campground');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')

const multer=require('multer');
const {storage}=require('../cloudinary');//node automatically looks for index.js file so need to include 
// const upload=multer({dest:'uploads/'});
upload=multer({storage});



router.route('/').get(catchAsyncs(campgrounds.index))
                .post(isLoggedIn, upload.array('image'), validateCampground,catchAsyncs(campgrounds.postNewCampground))
                // .post(upload.array('image'),(req,res)=>{
                //     console.log(req.body,req.files);
                //     res.send("woooo!");
                // })


router.get('/new', isLoggedIn, campgrounds.renderNewForm)


router.route('/:id').get(catchAsyncs(campgrounds.showCampground))
                    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsyncs(campgrounds.editCampground))
                    .delete(isLoggedIn, isAuthor, catchAsyncs(campgrounds.destroyCampground))


router.get('/:id/edit', isLoggedIn,catchAsyncs(campgrounds.renderEditForm))


module.exports = router;