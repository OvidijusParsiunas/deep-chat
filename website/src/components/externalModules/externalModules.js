export function importHighlight() {
  if (!window.hljs) {
    import('highlight.js').then((module) => {
      window.hljs = module.default;
    });
  }
}

export async function importHighlightAsync() {
  if (!window.hljs) {
    return import('highlight.js').then((module) => {
      window.hljs = module.default;
      return true;
    });
  }
  return true;
}

export function removeHighlight() {
  delete window.hljs;
}
