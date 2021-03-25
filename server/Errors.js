class RequirementNotMetError extends Error {
	constructor(msg) {
		super(msg);
		this.name = "RequirementNotMetError";
	}
}
class UniqueFieldViolationError extends Error {
	constructor(msg) {
		super(msg);
		this.name = "UniqueFieldViolationError";
	}
}
class UnauthorizedError extends Error {
	constructor(msg) {
		super(msg);
		this.name = "Unauthorized";
	}
}

module.exports = {
	RequirementNotMetError, UniqueFieldViolationError, UnauthorizedError
};