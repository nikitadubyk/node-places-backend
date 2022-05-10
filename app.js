const fs = require('fs')
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/https-error')

const mongoose = require('mongoose')
const app = express()

app.use(bodyParser.json())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE')
    next()
})

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404)
    throw error
})

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err)
        })
    }

    if (res.headerSent) {
        return next(error)
    }

    res.status(error.code || '500')
    res.json({ message: error.message || 'An unknown error!' })
})

mongoose
    .connect(
        'mongodb+srv://nikita_dubyk:UEyl0C0AUbJhNVz9@cluster0.sd3bq.mongodb.net/mern?retryWrites=true&w=majority'
    )
    .then(() => {
        app.listen(5000)
    })
    .catch(err => console.log(err))
