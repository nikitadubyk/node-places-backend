const HttpError = require('../models/https-error')
const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

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
        creater: 'u1',
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
        creater: 'u2',
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
        creater: 'u1',
    },
]

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(place => {
        return place.id === placeId
    })

    if (!place) {
        throw new HttpError('Coulnd find a place with a provided id', 404)
    }

    res.json({ place })
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(place => place.creater === userId)

    if (!places && places.length === 0) {
        return next(
            new HttpError('Coulnd find a places with a provided user id', 404)
        )
    }

    res.json({ place: places })
}

const createPlace = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        throw new HttpError(
            'Invalid inputs passed, please check your data',
            422
        )
    }

    const { title, description, location, address, creater } = req.body

    const createdData = {
        id: uuidv4(),
        title,
        description,
        location,
        address,
        creater,
    }

    DUMMY_PLACES.push(createdData)

    res.status(201)
    res.json({ place: createdData })
}

const patchPlace = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        throw new HttpError(
            'Invalid inputs passed, please check your data',
            422
        )
    }

    const { title, description } = req.body
    const placeId = req.params.pid

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) }
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
    updatedPlace.title = title
    updatedPlace.description = description

    DUMMY_PLACES[placeIndex] = updatedPlace

    res.status(200).json({ place: updatedPlace })
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid

    if (!DUMMY_PLACES.find(place => place.id !== placeId)) {
        throw new HttpError('Could not find a place with that id', 404)
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId)

    res.status(200).json({ message: 'Delete place!' })
}

module.exports = {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    patchPlace,
    deletePlace,
}
