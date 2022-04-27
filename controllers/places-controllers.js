const HttpError = require('../models/https-error')
const { v4: uuidv4 } = require('uuid')

const DUMMY_PLACES = [
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
        id: 'p2',
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

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid
    const place = DUMMY_PLACES.find(place => place.creater === userId)

    if (!place) {
        return next(
            new HttpError('Coulnd find a place with a provided user id', 404)
        )
    }

    res.json({ place })
}

const createPlace = (req, res, next) => {
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

module.exports = { getPlaceById, getPlaceByUserId, createPlace }
