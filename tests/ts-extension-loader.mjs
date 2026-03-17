import path from 'node:path';

export async function resolve(specifier, context, nextResolve) {
  const isRelative =
    specifier.startsWith('./') || specifier.startsWith('../');
  const hasExtension = path.extname(specifier) !== '';

  if (isRelative && !hasExtension) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch (_error) {
      // Fall through to Node's default resolution.
    }
  }

  return nextResolve(specifier, context);
}
