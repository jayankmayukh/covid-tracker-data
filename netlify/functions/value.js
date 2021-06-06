import data from '../../data.json';
import headers from '../headers';


export const handler = async ({ queryStringParameters: params }) => {
	const { country, code } = params;
	if (data[country]?.[code]) {
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ value: data[country][code] }),
		}
	}

    return {
        statusCode: 400,
		headers,
        body: JSON.stringify({ message: 'invalid input.', input: params }),
    };
};
