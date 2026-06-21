async function check() {
  try {
    const res = await fetch("http://localhost:3000/");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body length:", text.length);
    console.log("Snippet:", text.substring(0, 500));
  } catch (err) {
    console.error(err);
  }
}
check();
