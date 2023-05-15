export function importXLSX() {
  if (!window.XLSX) {
    import('xlsx').then((module) => {
      window.XLSX = module;
    });
  }
}
