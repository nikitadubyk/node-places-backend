const axios = require('axios')
const HttpError = require('../models/https-error')

API_KEY = '1fa667cf2ae40593f8ae1a5411b429b1'

async function getCoordsForAddress(address) {
    const { data } = await axios.get(
        `http://api.positionstack.com/v1/forward?access_key=${API_KEY}&query=${address}`
    )

    if (data.data.length === 0)
        throw new HttpError('Could not location for the address', 422)

    const location = {
        lng: data.data[0].longitude,
        lat: data.data[0].latitude,
    }

    return location
}

module.exports = getCoordsForAddress
