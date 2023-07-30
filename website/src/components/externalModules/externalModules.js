export function importHighlight() {
  if (!window.hljs) {
    import('highlight.js').then((module) => {
      window.hljs = module.default;
    });
  }
}
