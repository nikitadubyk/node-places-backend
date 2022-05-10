const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

const MINE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
}

const fileUpload = multer({
    limits: 50000,
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) => {
            const ext = MINE_TYPE_MAP[file.mimetype]
            cb(null, uuidv4() + '.' + ext)
        },
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MINE_TYPE_MAP[file.mimetype]
        const error = isValid ? null : new Error('Invalid mime type')
        cb(error, isValid)
    },
})

module.exports = fileUpload
