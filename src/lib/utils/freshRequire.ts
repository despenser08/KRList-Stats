// https://github.com/hughsk/fresh-require

export default function freshRequire(file: string) {
  const resolvedFile = require.resolve(file);

  const temp = require.cache[resolvedFile];
  delete require.cache[resolvedFile];

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const modified = require(resolvedFile);

  require.cache[resolvedFile] = temp;

  return modified;
}
