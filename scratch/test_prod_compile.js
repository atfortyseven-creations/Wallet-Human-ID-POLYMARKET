const code = `
fn main(x: Field, y: pub Field) {
    assert(x != y);
}
`;

fetch('https://humanidfi.com/api/zk/compile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sourceCode: code })
})
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
