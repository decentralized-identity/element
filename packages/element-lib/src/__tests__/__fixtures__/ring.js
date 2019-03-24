const getMembers = (g, p) => {
  let m = (g * g) % p;
  const members = [m];
  while (m !== g) {
    m = (m * g) % p;
    members.push(m);
  }
  return members.sort((a, b) => a > b);
};

(async () => {
  console.log(getMembers(2, 11));
  console.log(getMembers(7, 11));
  console.log(getMembers(6, 11));
  console.log(getMembers(8, 11));
})();
