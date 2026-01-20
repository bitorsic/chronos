// given an err object, it will return [httpStatusCode, errMessage]
const handleError = (err) => {
	if (err.name === "MongooseError") return [409, err.message];
	
	if (err.name === "ValidationError") 
		return [400, err.errors[Object.keys(err.errors)[0]].message || `Input validation failed`];

	// handling axios errors here if present
	if (err.response) 
		return [err.response.status || 500, err.response.data || err.message];

	return [500, err.message];
};

module.exports = {
	handleError,
};