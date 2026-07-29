export function exportToCsv(filename: string, rows: object[]) {
  if (!rows || !rows.length) {
    alert("Não há dados na tabela para exportar.");
    return;
  }

  const separator = ',';
  const keys = Object.keys(rows[0]).filter(k => typeof rows[0][k as keyof typeof rows[0]] !== 'object');
  
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell: any = row[k as keyof typeof row] === null || row[k as keyof typeof row] === undefined ? '' : row[k as keyof typeof row];
        cell = cell instanceof Date
          ? cell.toLocaleString()
          : (cell?.toString() || '').replace(/"/g, '""');
        if (typeof cell === 'string' && cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Use a temporary anchor element to trigger the download
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
