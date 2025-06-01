import fs from 'fs'
import path from 'path'

function expandDomains(urlPattern, domains) {
  return domains.map(domain => domain + urlPattern.slice("DOMAIN".length));
}

function processMatches(matches, domains) {
  let result = [];
  for (const url of matches) {
    if (typeof url === 'string' && url.startsWith("DOMAIN")) {
      result.push(...expandDomains(url, domains));
    } else {
      result.push(url);
    }
  }
  return result;
}

function recursivelyExpandDomains(obj, domains) {
  if (Array.isArray(obj)) {
    return obj.map(item => recursivelyExpandDomains(item, domains));
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      if (key === 'matches') {
        newObj[key] = processMatches(obj[key], domains);
      } else {
        newObj[key] = recursivelyExpandDomains(obj[key], domains);
      }
    }
    return newObj;
  } else {
    return obj;
  }
}

export function vitePluginManifestDomainExpander(options = {}) {
  const manifestPath = options.manifestPath || path.resolve(process.cwd(), 'public/manifest.json');
  const outputDir = options.outputDir || path.resolve(process.cwd(), 'dist');

  return {
    name: 'vite-plugin-manifest-domain-expander',

    buildStart() {
      if (!fs.existsSync(manifestPath)) {
        this.error(`Manifest file not found at ${manifestPath}`);
        return;
      }
    },

    generateBundle() {
      const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestRaw);

      if (!Array.isArray(manifest.host_permissions)) {
        this.error(`host_permissions field missing or not an array in manifest`);
        return;
      }

      const domains = manifest.host_permissions.map(url => url.replace(/\/$/, ''));

      const updatedManifest = recursivelyExpandDomains(manifest, domains);

      const outputPath = path.resolve(outputDir, 'manifest.json');
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(updatedManifest, null, 2), 'utf8');

      this.warn(`Manifest copied and updated with expanded DOMAIN patterns at ${outputPath}`);
    }
  }
}
