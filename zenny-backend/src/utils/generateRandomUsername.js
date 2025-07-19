export const generateRandomUsername = () => {
	const adjectives = ["Swift", "Brave", "Clever", "Bold", "Happy", "Mighty", "Witty"];
	const animals = ["Fox", "Otter", "Hawk", "Bear", "Wolf", "Eagle", "Panda"];
	const number = Math.floor(1000 + Math.random() * 9000);

	const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
	const animal = animals[Math.floor(Math.random() * animals.length)];

	return `${adjective}${animal}${number}`;
};
