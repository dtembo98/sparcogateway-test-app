require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const colors = require('colors');
const axios = require('axios');
const asyncHandler = require('./middlewares/async');
const errorHandler = require('./middlewares/error');
const ErrorResponse = require('./utils/ErrorResponse');
const cors = require('cors');
const { generatepayload, creditPayload } = require('./utils/helpers');
//  const SEC_KEY = '<MERCHANT_SECRET_KEY>';
//  const PUB_KEY = '<MERCHANT_PUBLIC_KEY>';

//USE THE DETAILS USED TO CREATE AN ACCOUNT ON SPARCO
let _to;
const PUB_KEY = {
	pubKey: process.env.MERCHANT_PUBLIC_KEY,
};
//endpoints
const endpoint_balance =
	'https://live.sparco.io/gateway/api/v1/account/balance';
const endpoint_credit = 'https://live.sparco.io/gateway/api/v1/momo/credit';
const endpoint_debit = 'https://live.sparco.io/gateway/api/v1/momo/debit';
//signed payloads with jwt
// const encoded_payload = jwt.sign(payload, process.env.MERCHANT_SECRET_KEY);

//palyload for checking ledger_balances
const ledgerPayload = jwt.sign(PUB_KEY, process.env.MERCHANT_SECRET_KEY);
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
	res.send(
		'<h3>Welcome to a test app to test mobile money payment methods on a sparco gateway </h3>'
	);
});

//collect
app.post(
	'/debit',
	asyncHandler(async (req, res, next) => {
		const { amount, from, to } = req.body;
		_to = to;
		//generate payload
		const encoded_payload = generatepayload(amount, from);
		console.log('sending request');
		//send payload
		const results = await axios.post(endpoint_debit, {
			payload: encoded_payload,
		});

		if (results.data.isError) {
			return next(new ErrorResponse(`${results.data.message}`, 500));
		}
		return res.status(200).json({ message: 'awaiting approval' });
	})
);

//testing the webhook response
// have not yet added code to verify the source of the webhook
app.post(
	'/hook',
	asyncHandler(async (req, res, next) => {
		console.log(req);
		if (req.body.isError) {
			return next(new ErrorResponse('transaction failed', 404));
		}
		const encoded_payload = creditPayload(req.body.amount, _to);
		//if success
		const results = await axios.post(endpoint_credit, {
			payload: encoded_payload,
		});
		if (results.data.isError) {
			console.log('error occured');
			return next(new ErrorResponse(`${results.data.message}`, 500));
		}
		res.status(200).json({
			message: 'Transaction approved',
		});
	})
);
// //disburse
// app.get(
// 	'/credit',
// 	asyncHandler(async (req, res, next) => {
// 		const results = await axios.post(endpoint_credit, {
// 			payload: encoded_payload,
// 		});
// 		if (results.data.isError) {
// 			return next(new ErrorResponse(`${results.data.message}`, 500));
// 		}
// 		res.status(200).json({
// 			message: 'Transaction awaiting approval',
// 		});
// 	})
// );
app.use(errorHandler);
const server = app.listen(PORT, () => {
	console.log(`server listening on port ${PORT}`.blue.bold);
});
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error ${err.message}`.red);
	server.close(() => process.exit());
});
