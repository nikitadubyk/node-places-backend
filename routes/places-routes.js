const express = require('express')

const {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    patchPlace,
    deletePlace,
} = require('../controllers/places-controllers')

const router = express.Router()

router.get('/:pid', getPlaceById)

router.get('/user/:uid', getPlacesByUserId)

router.post('/', createPlace)

router.patch('/:pid', patchPlace)

router.delete('/:pid', deletePlace)

module.exports = router
