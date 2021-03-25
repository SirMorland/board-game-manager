let MongoClient = require('mongodb').MongoClient;

let MONGO_URL = "";

let mongo = null;

/**
 * @returns MongoDB instance
 */
let getDB = async () => {
	if(!mongo) {
		mongo = new MongoClient(
			MONGO_URL,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true
			}
		);

		await mongo.connect();
	}

	return mongo.db('bgm');
}

module.exports = getDB;