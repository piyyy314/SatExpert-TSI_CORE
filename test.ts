fetch("http://localhost:3000").then(r => r.text()).then(t => console.log(t)).catch(console.error);
