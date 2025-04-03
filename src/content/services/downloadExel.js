function downloadExcel(data, columnsConfig, filename = "data.xlsx") {
    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(columnsConfig) || columnsConfig.length === 0) {
        console.error("Invalid data format");
        return;
    }

    // Extract column headers and field names
    const columns = columnsConfig.map(col => col.header);
    
    // Create field mappings (header to data field)
    const fieldMappings = columnsConfig.reduce((mapping, col) => {
        mapping[col.header] = col.field || col.header;
        return mapping;
    }, {});

    // Format data according to the column configuration
    const formattedData = data.map(item => {
        let row = {};
        columnsConfig.forEach(col => {
            const fieldName = col.field || col.header;
            row[col.header] = item[fieldName] ?? "";
        });
        return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: columns });

    // Set column widths
    worksheet["!cols"] = columnsConfig.map(col => ({ wch: col.size || 20 }));

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate Excel buffer and blob
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    // Create download URL
    const url = URL.createObjectURL(blob);

    // Download using Chrome API or a link element
    if (typeof chrome !== "undefined" && chrome.downloads) {
        chrome.downloads.download({
            url: url,
            filename: filename
        });
    } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Clean up URL object
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}