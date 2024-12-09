const express=require('express');
const router=express.Router({mergeParams:true});//mergeParams because of app.use('/campgrounds/:id/reviews', reviews); make id accessible


const Campground = require('../models/campground');
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsyncs');
const ExpressError = require('../utils/expressError');
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware');
const review = require('../models/review');
const reviews=require('../controllers/reviews')



router.post('/',isLoggedIn, validateReview, catchAsync(reviews.postReview))

router.delete('/:reviewId', isLoggedIn,isReviewAuthor,catchAsync(reviews.destroyReview))

module.exports=router;