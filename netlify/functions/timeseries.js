import data from '../../data.json'
import headers from '../headers';

const tzOffset = new Date().getTimezoneOffset() * 60 * 1000

export const handler = async ({ queryStringParameters: params }) => {
    let { country, key, xAxis: xAxisStr } = params
    let xAxis = Number(xAxisStr)
    let series = []
    let countryData = data[country].data
    let isValid = Array.isArray(countryData) && countryData.some((point) => key in point)
    if (!isValid) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'invalid input.', input: params }),
        }
    }
    if ([1, 2].includes(xAxis)) {
        countryData = countryData.filter((value) => {
            return value.total_cases >= 100
        })
    }
    if ([3].includes(xAxis)) {
        countryData = countryData.filter((value) => {
            return value.total_vaccinations >= 1
        })
    }
    countryData.forEach((value, i) => {
        let xVal
        switch (xAxis) {
            case 1:
                xVal = i
                break
            case 2:
                xVal = value.total_cases
                break
            case 3:
                xVal = i
                break
            default:
                xVal = Date.parse(value.date) - tzOffset
                break
        }
        if (typeof value[key] !== undefined) {
            series.push([xVal, value[key]])
        }
    })
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(series),
    }
}
