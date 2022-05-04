const HttpError = require('../models/https-error')
const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const getCoordsForAddress = require('../utils/location')
const Place = require('../models/place')

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empyre state building',
        description: 'One on the most famous sky scrapers in the world',
        location: {
            lat: 40.30413,
            lng: 73.9788,
        },
        address: 'Kirova 6',
        creator: 'u1',
    },
    {
        id: 'p2',
        title: 'Emp. state building',
        description: 'One on the most famous sky scrapers in the world',
        location: {
            lat: 40.30413,
            lng: 73.9788,
        },
        address: 'asdfasdf',
        creator: 'u2',
    },
    {
        id: 'p3',
        title: 'Emp. state building',
        description: 'One on the most famous sky scrapers in the world',
        location: {
            lat: 40.30413,
            lng: 73.9788,
        },
        address: 'asdfasdf',
        creator: 'u1',
    },
]

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
    let places = []

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

    const createdData = new Place({
        title,
        description,
        address,
        location,
        image: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg',
        creator,
    })

    try {
        await createdData.save()
    } catch (error) {
        const err = new HttpError('Creating place failed, try again', 500)
        return next(err)
    }

    res.status(201)
    res.json({ place: createdData })
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

    let place = await Place.findById(placeId)

    if (!place) {
        return next(new HttpError('Could not find a place with that id', 404))
    }

    try {
        await place.remove()
    } catch (error) {
        const err = new HttpError(
            'Something went wrong, could not delete place',
            500
        )
        return next(err)
    }

    res.status(200).json({ message: 'Delete place!' })
}

module.exports = {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    patchPlace,
    deletePlace,
}
