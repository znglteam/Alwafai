// A script to see if we can parse the dates correctly.
const now = new Date().getTime();
const past = new Date(new Date().getTime() - 2 * 60 * 1000).toISOString();
const diff = now - new Date(past).getTime();
console.log("Diff:", diff);
