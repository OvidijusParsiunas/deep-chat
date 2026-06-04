// Export/import of downloaded web-model files.
//
// The MLCEngine API (new web-llm) no longer returns the downloaded files from reload();
// instead the runtime stores every artifact in the browser Cache API, keyed by its full
// fetch URL, under three scopes. We read those entries to let the user export the model,
// and write uploaded files back into the cache so reload() resolves them offline (allowing
// a model downloaded on one domain to be re-used on another via export -> upload).
//
// IMPORTANT: requires the engine to use the default Cache API backend (cacheBackend: 'cache').
export class WebModelFiles {
  // Cache scopes used by web-llm's ArtifactCache. Must stay in sync with the runtime.
  public static readonly CACHE_SCOPES = ['webllm/model', 'webllm/wasm', 'webllm/config'];
  // Separator embedded in exported file names so the original scope + url can be recovered.
  private static readonly SEP = '__DC__';

  private static scopeToTag(scope: string) {
    return scope.replace('webllm/', '');
  }

  private static encodeName(scope: string, url: string) {
    const basename = url.split('/').pop() || 'file';
    // eslint-disable-next-line max-len
    return `${basename}${WebModelFiles.SEP}${WebModelFiles.scopeToTag(scope)}${WebModelFiles.SEP}${encodeURIComponent(url)}`;
  }

  // Returns {scope, url} recovered from an exported file name, or undefined if unrecognised.
  private static decodeName(name: string) {
    const parts = name.split(WebModelFiles.SEP);
    if (parts.length < 3) return undefined;
    const url = decodeURIComponent(parts[parts.length - 1]);
    const scope = `webllm/${parts[parts.length - 2]}`;
    if (!WebModelFiles.CACHE_SCOPES.includes(scope)) return undefined;
    return {scope, url};
  }

  // Read all cached model artifacts into File objects for download/export.
  public static async exportFromCache(): Promise<File[]> {
    if (typeof caches === 'undefined') return [];
    const files: File[] = [];
    for (const scope of WebModelFiles.CACHE_SCOPES) {
      if (!(await caches.has(scope))) continue;
      const cache = await caches.open(scope);
      const requests = await cache.keys();
      for (const request of requests) {
        const response = await cache.match(request);
        if (!response) continue;
        const blob = await response.blob();
        files.push(new File([blob], WebModelFiles.encodeName(scope, request.url)));
      }
    }
    return files;
  }

  // Seed the cache from previously-exported files so a subsequent reload() resolves offline.
  public static async importToCache(files: FileList | File[]): Promise<void> {
    if (typeof caches === 'undefined') return;
    for (const file of Array.from(files)) {
      const decoded = WebModelFiles.decodeName(file.name);
      if (!decoded) continue;
      const cache = await caches.open(decoded.scope);
      await cache.put(new Request(decoded.url), new Response(await file.arrayBuffer()));
    }
  }
}
