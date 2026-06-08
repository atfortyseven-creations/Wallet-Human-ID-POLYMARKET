fetch('https://api.github.com/repos/noir-lang/noir/releases/tags/v0.36.0').then(r=>r.json()).then(j => {
  console.log("TAG:", j.tag_name);
  console.log("ASSETS:");
  j.assets.forEach(a => console.log(a.name));
});
