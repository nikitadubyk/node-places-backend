const HttpError = require('../models/https-error')
const { validationResult } = require('express-validator')
const User = require('../models/user')

const getAllUsers = async (req, res, next) => {
    let users
    try {
        users = await User.find({}, '-password')
    } catch (error) {
        const err = new HttpError(
            'Something went wrong, could not get users',
            500
        )
        return next(err)
    }

    if (!users || users.length === 0) {
        return next(new HttpError('Users could not get found', 500))
    }

    res.status(200).json(users.map(user => user.toObject({ getters: true })))
}

const createUser = async (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return next(
            new HttpError('Not valid data, please check your data', 422)
        )
    }

    const { name, email, password } = req.body

    let existUser

    try {
        existUser = await User.find({ email: email })
    } catch (error) {
        return next(new HttpError('Signup is failed, try again', 422))
    }

    if (existUser.length > 0) {
        return next(
            new HttpError('User with this email has been registered!', 422)
        )
    }

    const createdUser = new User({
        email,
        password,
        name,
        image: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg',
        places: [],
    })

    try {
        await createdUser.save()
    } catch (error) {
        const err = new HttpError('Signup failed, try again', 500)
        return next(err)
    }

    res.status(200).json({ users: createdUser.toObject({ getters: true }) })
}

const login = async (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return next(
            new HttpError('Not valid data, please check your data', 422)
        )
    }

    const { email, password } = req.body

    let correctUser

    try {
        correctUser = await User.find({ email: email })
    } catch (error) {
        return next(new HttpError('Login failed, try again!', 500))
    }

    if (!correctUser && correctUser.password !== password) {
        return next(
            new HttpError('Could not identify user, something to be wrong', 401)
        )
    }

    res.status(200).json({ message: 'You loggin! Welcome!' })
}

module.exports = { getAllUsers, createUser, login }
