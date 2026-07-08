fetch('https://humanidfi.com/api/dev/deploy')
  .then(res => res.text().then(text => ({status: res.status, text})))
  .then(console.log)
  .catch(console.error);
