const jwt = require('jsonwebtoken')

const HttpError = require('../models/https-error')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1] //Authorizathion: 'Bearer TOKEN'
        if (!token) throw new Error('Authentication failed')

        const decodedToken = jwt.verify(token, 'private_key')
        req.userData = { userId: decodedToken.userId }
        next()
    } catch (error) {
        return next(new HttpError('Authentication failed', 401))
    }
}
