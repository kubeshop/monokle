const fs = require('fs');
const path = require('path');

const parsePackageFile = () => {
  const packageJson = path.join(process.cwd(), './package.json');
  const content = fs.readFileSync(path.resolve(packageJson), 'utf-8', (err: Error, data: string) => {
    if (err) {
      throw err;
    }
    return data;
  });
  return JSON.parse(content);
};

export const getDependencyVersion = (dependencyName: Array<string>): {name: string; version: string}[] => {
  const parsedContent = parsePackageFile();
  return dependencyName.map(name => ({
    name,
    version: (parsedContent.dependencies[name] as string) || parsedContent.devDependencies[name] || '',
  }));
};
