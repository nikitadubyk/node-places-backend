const fs = require('fs')
const HttpError = require('../models/https-error')
const { validationResult } = require('express-validator')
const getCoordsForAddress = require('../utils/location')
const Place = require('../models/place')
const User = require('../models/user')
const mongoose = require('mongoose')

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid
    let place

    try {
        place = await Place.findById(placeId)
    } catch (error) {
        const err = new HttpError('Coulnd find a place with a provided id', 404)
        return next(err)
    }

    if (!place) {
        const error = new HttpError(
            'Coulnd find a place with a provided id',
            404
        )
        return next(error)
    }

    res.json({ place: place.toObject({ getters: true }) })
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid
    let places

    try {
        places = await Place.find({ creator: userId })
    } catch (error) {
        const err = new HttpError('Something went wrong, try again', 500)
        return next(err)
    }

    if (!places || places.length === 0) {
        return next(
            new HttpError('Coulnd find a places with a provided user id', 404)
        )
    }

    res.json({ place: places.map(place => place.toObject({ getters: true })) })
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data', 422)
        )
    }

    const { title, description, address, creator } = req.body

    let location
    try {
        location = await getCoordsForAddress(address)
    } catch (error) {
        return next(error)
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location,
        image: req.file.path,
        creator,
    })

    let user

    try {
        user = await User.findById(creator)
    } catch (error) {
        return next(new HttpError('Creating place failed, try again', 500))
    }

    if (!user) {
        return next(
            new HttpError('Could not find user by for provided id', 404)
        )
    }

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await createdPlace.save({ session: sess })
        user.places.push(createdPlace)
        console.log(user)
        await user.save({
            validateModifiedOnly: true,
            session: sess,
        })
        await sess.commitTransaction()
    } catch (error) {
        console.log(error)
        const err = new HttpError('Creating place failed, try again', 500)
        return next(err)
    }

    res.status(201)
    res.json({ place: createdPlace })
}

const patchPlace = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        throw new HttpError(
            'Invalid inputs passed, please check your data',
            422
        )
    }

    const { title, description } = req.body
    const placeId = req.params.pid

    let place

    try {
        place = await Place.findById(placeId)
    } catch (error) {
        const err = new HttpError(
            'Something went wrong, could not update place',
            500
        )
        return next(err)
    }

    place.title = title
    place.description = description

    try {
        await place.save()
    } catch (error) {
        const err = new HttpError(
            'Something went wrong, could not update place',
            500
        )
        return next(err)
    }

    res.status(200).json({ place: place.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid

    let place

    try {
        place = await Place.findById(placeId).populate('creator')
    } catch (error) {
        const err = new HttpError(
            'Something went wrong, could not update place',
            500
        )
        return next(err)
    }

    if (!place) {
        return next(new HttpError('Could not find a place with that id', 404))
    }

    const imagePath = place.image

    try {
        const sess = await mongoose.startSession()

        sess.startTransaction()
        await place.remove({ session: sess })
        place.creator.places.pull(place)
        await place.creator.save({ session: sess })
        await sess.commitTransaction()
    } catch (error) {
        const err = new HttpError(
            'Something went wrong, could not delete place',
            500
        )
        return next(err)
    }

    fs.unlink(imagePath, err => {
        console.log(err)
    })

    res.status(200).json({ message: 'Delete place!' })
}

module.exports = {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    patchPlace,
    deletePlace,
}
