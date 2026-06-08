fetch('https://api.github.com/repos/noir-lang/noir/releases/latest').then(r=>r.json()).then(j => {
  console.log("TAG:", j.tag_name);
  console.log("ASSETS:");
  j.assets.forEach(a => console.log(a.name));
});
