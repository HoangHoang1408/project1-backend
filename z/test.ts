const haha = {
  ok: true,
  hoang: 'hoang',
  dog: undefined,
};
const b = {};
Object.entries(haha).forEach(([key, value]) => {
  if (value) b[key] = value;
});
console.log(b);
