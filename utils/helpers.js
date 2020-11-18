const jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const generatepayload = (amount, mobileNumber) => {
	const payload = {
		amount: amount,
		currency: 'ZMW',
		customerEmail: 'david@gmail.com',
		customerFirstName: 'David',
		customerLastName: 'Tembo',
		customerPhone: '0979789839',
		merchantPublicKey: process.env.MERCHANT_PUBLIC_KEY,
		transactionName: 'deposit',
		transactionReference: uuid(),
		wallet: mobileNumber,
		chargeMe: false,
	};

	const encoded_payload = jwt.sign(payload, process.env.MERCHANT_SECRET_KEY);
	return encoded_payload;
};

const creditPayload = (amount, mobileNumber) => {
	const payload = {
		amount: amount,
		currency: 'ZMW',
		customerEmail: 'david@gmail.com',
		customerFirstName: 'David',
		customerLastName: 'Tembo',
		customerPhone: '0979789839',
		merchantPublicKey: process.env.MERCHANT_PUBLIC_KEY,
		transactionName: 'deposit',
		transactionReference: uuid(),
		wallet: mobileNumber,
		chargeMe: false,
	};

	const encoded_payload = jwt.sign(payload, process.env.MERCHANT_SECRET_KEY);
	return encoded_payload;
};

module.exports = {
	generatepayload,
	creditPayload,
};
