const PomodoroClock = require('./PomodoroClock');

const clockOne = new PomodoroClock(
	0.5,
	0.5,
	2,
	(state) => console.log(state) // eslint-disable-line no-console
);

clockOne.startSession();
