class ErrorResponse extends Error {
	constructor(messga, statusCode) {
		super(messga);
		this.statusCode = statusCode;
	}
}

module.exports = ErrorResponse;
