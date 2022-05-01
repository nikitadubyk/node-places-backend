const { v4: uuidv4 } = require('uuid')
const HttpError = require('../models/https-error')
const { validationResult } = require('express-validator')

const DUMMY_USERS = [
    {
        id: 'u1',
        email: 'test@mail.ru',
        password: 'testPassword',
        name: 'Nikita',
    },
    {
        id: 'u2',
        email: 'test234@mail.ru',
        password: 'secondTest',
        name: 'Max',
    },
]

const getAllUsers = (req, res, next) => {
    res.status(200).json(DUMMY_USERS)
}

const createUser = (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        throw new HttpError('Not valid data, please check your data', 422)
    }

    const { name, email, password } = req.body

    const hasUser = DUMMY_USERS.find(user => user.email === email)

    if (hasUser) {
        throw new HttpError('User with this email has been registered!', 422)
    }

    const newUser = {
        id: uuidv4(),
        email,
        password,
        name,
    }

    DUMMY_USERS.push(newUser)

    res.status(200).json({ users: DUMMY_USERS })
}

const login = (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        throw new HttpError('Not valid data, please check your data', 422)
    }

    const { email, password } = req.body

    const correctUser = DUMMY_USERS.find(user => user.email === email)

    if (!correctUser && correctUser.password !== password) {
        throw new HttpError(
            'Could not identify user, something to be wrong',
            401
        )
    }

    res.status(200).json({ message: 'You loggin! Welcome!' })
}

module.exports = { getAllUsers, createUser, login }
