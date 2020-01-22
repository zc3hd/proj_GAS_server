var list_data = [];
var one;
for (var i = 0; i < 371; i++) {
  one = {}
  one.time = i < 150 ? 0 : 1;
  one.push = Math.random() < 0.5 ? true : false;

  list_data.push(one);
}