export let signup = async (username, email, password) => {
	let response = await fetch('/api/auth/signup', {
		method: "POST",
		headers: { 'Content-Type': "application/json" },
		body: JSON.stringify({ username, email, password })
	});

	if(response.ok) {
		return await response.json();
	}

	checkErrors(response);
}

export let login = async (username, password) => {
	let response = await fetch('/api/auth/login', {
		method: "POST",
		headers: { 'Content-Type': "application/json" },
		body: JSON.stringify({ username, password })
	});

	if(response.ok) {
		return await response.json();
	}

	checkErrors(response);
}

export let verify = async () => {
	let response = await fetch("/api/auth/verify");
	if(response.ok) {
		return await response.json();
	}
	
	checkErrors(response);
}

export let logout = async () => {
	await fetch("/api/auth/logout");
}

let checkErrors = response => {
	if(response.status === 400) {
		throw new BadRequest();
	}
	if(response.status === 401) {
		throw new Unauthorized();
	}
	if(response.status === 409) {
		throw new Conflict();
	}
}

/* Errors */

export class BadRequest extends Error { }
export class Unauthorized extends Error { }
export class Conflict extends Error { }
