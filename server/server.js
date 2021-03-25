const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');
const fs = require('fs');

const Auth = require('./Controllers/Auth');

const app = express();
const port = 3001;

/* API Server */

app.use(express.json());
app.use(cookieParser());

app.post("/api/auth/signup", Auth.signup);
app.get("/api/auth/verify", Auth.verify);
app.post("/api/auth/login", Auth.login);
app.get("/api/auth/logout", Auth.logout);

/* Start React front end on production */

if(process.env.NODE_ENV === "production") {
	app.use("/", express.static('build'));

	app.get("*", (_, response) => {
		const filePath = path.resolve(__dirname, './build', 'index.html');

		fs.readFile(filePath, 'utf8', (error, data) => {
			if (error) {
				return console.log(err);
			}

			response.send(data);
		});
	});
}

/* Start server */

app.listen(port, () => console.log(`Listening on port ${port}`));