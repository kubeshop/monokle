const fs = require('fs');
const path = require('path');

let packageJson = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');

packageJson = packageJson.replaceAll('./build/', './');

packageJson = JSON.parse(packageJson);

delete packageJson.scripts;
delete packageJson.devDependencies;

packageJson = JSON.stringify(packageJson, null, 2);

fs.writeFileSync(path.join(__dirname, 'build', 'package.json'), packageJson);
