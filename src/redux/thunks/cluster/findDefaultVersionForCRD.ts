/**
 * Find the default version in line with the algorithm described at
 * https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/#version-priority
 */

const crdVersionRegex = /(v)(\d*)(alpha|beta)?(\d*)?/;

export function findDefaultVersionForCRD(crd: any) {
  if (!crd?.spec?.versions) {
    return undefined;
  }

  const versionNames: string[] = crd.spec.versions.map((v: any) => v.name);

  versionNames.sort((a, b) => {
    const m1 = crdVersionRegex.exec(a);
    const m2 = crdVersionRegex.exec(b);

    // do both versions match the regex?
    if (m1 && m2) {
      // do both have initial version number?
      if (m1[2] && m2[2]) {
        // is the initial version the same?
        if (m1[2] === m2[2]) {
          // do both have an alpha or beta tag?
          if (m1[3] && m2[3]) {
            // is the tag the same?
            if (m1[3] === m2[3]) {
              // do both have an alpha or beta version?
              if (m1[4] && m2[4]) {
                return parseInt(m1[4], 10) - parseInt(m2[4], 10);
              }
              return m1[4] ? 1 : -1;
            }
            // compare tags (negate for beta > alpha)
            return -m1[3].localeCompare(m2[3]);
          }
          return m1[3] ? 1 : -1;
        }
        // compare version numbers
        return parseInt(m2[2], 10) - parseInt(m1[2], 10);
      }
      return m1[2] ? 1 : -1;
    }
    if (m1) return 1;
    if (m2) return -1;

    return a.localeCompare(b);
  });

  return versionNames.length > 0 ? versionNames[0] : undefined;
}
