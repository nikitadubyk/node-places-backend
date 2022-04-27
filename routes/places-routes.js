const express = require('express')

const {
    getPlaceById,
    getPlaceByUserId,
    createPlace,
} = require('../controllers/places-controllers')

const router = express.Router()

router.get('/:pid', getPlaceById)

router.get('/user/:uid', getPlaceByUserId)

router.post('/', createPlace)

module.exports = router
