const fs = require('fs').promises;
const path = require('path');

const parsePackageFile = async () => {
  const packageJson = path.join(process.cwd(), './package.json');
  const content = await fs.readFile(path.resolve(packageJson), 'utf-8', (err: Error, data: string) => {
    if (err) {
      throw err;
    }
    return data;
  });
  return JSON.parse(content);
};

export const getDependencyVersion = async (
  dependencyName: Array<string>
): Promise<{name: string; version: string}[]> => {
  const parsedContent = await parsePackageFile();
  return dependencyName.map(name => ({
    name,
    version: (parsedContent.dependencies[name] as string) || parsedContent.devDependencies[name] || '',
  }));
};
