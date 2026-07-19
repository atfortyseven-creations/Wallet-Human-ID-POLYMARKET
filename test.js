fetch('https://humanidfi.com/api/auth/nonce')
  .then(res => res.text().then(text => console.log(res.status, text)))
  .catch(console.error);
