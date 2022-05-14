const express = require('express')
const { check } = require('express-validator')
const fileUpload = require('../middleware/file-upload')
const checkAuth = require('../middleware/check-auth')

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

router.use(checkAuth)

router.post(
    '/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty(),
    ],
    createPlace
)

router.patch(
    '/:pid',
    [
        check('title').isLength({ min: 5 }),
        check('description').isLength({ min: 5 }),
    ],
    patchPlace
)

router.delete('/:pid', deletePlace)

module.exports = router
