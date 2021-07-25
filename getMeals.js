const bent = require('bent')
const getJSON = bent('string')

async function getMealToday(serachedDate, id) {
    let res = await getJSON(`https://openmensa.org/api/v2/canteens/${id}/days/${serachedDate}/meals`)
    let parsed = JSON.parse(res)
    return parsed
}

module.exports = { getMealToday }