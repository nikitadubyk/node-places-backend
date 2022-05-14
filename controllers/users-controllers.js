const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
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

    let hashPassword
    try {
        hashPassword = await bcrypt.hash(password, 12)
    } catch (error) {
        return next('Create user is failed, try again', 500)
    }

    const createdUser = new User({
        email,
        password: hashPassword,
        name,
        image: req.file.path,
        places: [],
    })

    try {
        await createdUser.save()
    } catch (error) {
        const err = new HttpError('Signup failed, try again', 500)
        return next(err)
    }
    let token

    token = jwt.sign(
        {
            userId: createdUser.id,
            email: createdUser.email,
        },
        'private_key',
        {
            expiresIn: '1h',
        }
    )

    res.status(200).json({
        userId: createdUser.id,
        email: createdUser.email,
        token,
    })
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
        correctUser = await User.findOne({ email: email })
    } catch (error) {
        return next(new HttpError('Login failed, try again!', 500))
    }

    if (!correctUser) {
        return next(
            new HttpError('Could not identify user, something to be wrong', 500)
        )
    }

    const isValidPassword = bcrypt.compareSync(password, correctUser.password)

    if (!isValidPassword) {
        return next(new HttpError('Password is wrong, try again', 500))
    }

    let token

    token = jwt.sign(
        {
            userId: correctUser.id,
            email: correctUser.email,
        },
        'private_key',
        {
            expiresIn: '1h',
        }
    )

    res.status(200).json({
        userId: correctUser.id,
        email: correctUser.email,
        token,
    })
}

module.exports = { getAllUsers, createUser, login }
