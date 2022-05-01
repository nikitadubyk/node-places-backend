const express = require('express')
const { check } = require('express-validator')

const {
    getAllUsers,
    createUser,
    login,
} = require('../controllers/users-controllers')
const router = express.Router()

router.get('/', getAllUsers)

router.post(
    '/singup',
    [
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 }),
        check('name').not().isEmpty().isLength({ min: 2 }),
    ],
    createUser
)

router.post(
    '/login',
    [
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 }),
    ],
    login
)

module.exports = router
