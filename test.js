const fs = require('fs');

const content = fs.readFileSync('./text.txt').toString();

// console.log(content);

const lines = content.split('\n');

// console.log(lines);

// const line = lines[0].split(/\s{2,40}/);
//
// console.log('line', line);

const permissions = [];
let hasFullPermissions = false;

lines.forEach((line, index) => {
  if (!index) {
    return;
  }
  const columns = line.split(/\s{2,100}/);
  console.log('columns', columns);

  const [resourceName, , , rawVerbs] = columns;

  if (!resourceName) {
    return;
  }

  const cleanVerbs = rawVerbs
    .replaceAll('[', '')
    .replaceAll(']', '');

  console.log('line', line);
  console.log('cleanVerbs', cleanVerbs);


  if (resourceName === '*.*' && cleanVerbs === '*') {
    hasFullPermissions = true;
  }

  const verbs = cleanVerbs ? cleanVerbs.split(' ') : [];


  permissions.push({
    resourceName: resourceName,
    verbs,
  });
});

console.log('permissions', permissions);
