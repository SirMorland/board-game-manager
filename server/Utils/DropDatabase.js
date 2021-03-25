let getDB = require('../db');

(async () => {
	let db = await getDB();
	await db.dropDatabase();
	console.log("ok");
	process.exit();
})();