require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const request = require('request');
const axios = require('axios');
const { json } = require('express');

//  const SEC_KEY = '<MERCHANT_SECRET_KEY>';
//  const PUB_KEY = '<MERCHANT_PUBLIC_KEY>';

//USE THE DETAILS USED TO CREATE AN ACCOUNT ON SPARCO
const payload = {
	amount: 1,
	currency: 'ZMW',
	customerEmail: '',
	customerFirstName: '',
	customerLastName: '',
	customerPhone: '',
	merchantPublicKey: process.env.MERCHANT_PUBLIC_KEY,
	transactionName: 'Service/product',
	transactionReference: uuid(),
	wallet: '',
	chargeMe: false,
};

const PUB_KEY = {
	pubKey: process.env.MERCHANT_PUBLIC_KEY,
};
//endpoints
const endpoint_balance =
	'https://live.sparco.io/gateway/api/v1/account/balance';
const endpoint_credit = 'https://live.sparco.io/gateway/api/v1/momo/credit';
const endpoint_debit = 'https://live.sparco.io/gateway/api/v1/momo/debit';
//signed payloads with jwt
const encoded_payload = jwt.sign(payload, process.env.MERCHANT_SECRET_KEY);

//palyload for checking ledger_balances
const ledgerPayload = jwt.sign(PUB_KEY, process.env.MERCHANT_SECRET_KEY);

app.get('/', (req, res) => {
	res.send(
		'<h3>Welcome to a test app to test mobile money payment methods on a sparco gateway </h3>'
	);
});

//collect
app.get('/debit', async (req, res) => {
	try {
		const results = await axios.post(endpoint_debit, {
			payload: encoded_payload,
		});
		if (results) {
			res.send(
				`<h3 style= "color:green;"> ${results.data.message}  </h3>`
			);
		}
	} catch (err) {
		res.send(`<h3 style= "color:red;">${err.response.data.message} </h3>`);
	}
});

//disburse
app.get('/credit', async (req, res) => {
	try {
		const results = await axios.post(endpoint_credit, {
			payload: encoded_payload,
		});
		if (!results.data.isError) {
			res.send(
				`<h3 style= "color:green;">Hello ${results.data.message} </h3>`
			);
		} else {
			res.send(
				`<h3 style= "color:red;">Hello ${results.data.status} </h3>`
			);
		}
	} catch (err) {
		res.send(
			`<h3 style= "color:red;">Hello ${err.response.data.message} </h3>`
		);
	}
});
//checking for ledger balances
app.get('/balance', async (req, res) => {
	try {
		const results = await axios.get(endpoint_balance, {
			token: ledgerPayload,
		});
		if (results) {
			res.send(
				`<h3 style= "color:green;">Hello ${results.data.message} </h3>`
			);
		}
	} catch (err) {
		console.log(PUB_KEY);
		res.send(
			`<h3 style= "color:red;">Hello ${err.response.data.message} </h3>`
		);
	}
});
//testing the webhook response
// have not yet added code to verify the source of the webhook
app.post('/hook', (req, res) => {
	console.log(req);
	res.status(200).end();
});

app.listen(PORT, () => {
	console.log(`server listening on port ${PORT}`);
});
