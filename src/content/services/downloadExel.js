/**
 * Downloads data as Excel file with customizable column settings
 * @param {Array} data - Array of data objects to export
 * @param {Array} columnsConfig - Array of column configuration objects
 * @param {string} columnsConfig[].header - Column header name
 * @param {string} [columnsConfig[].field] - Field name in data (defaults to header if not provided)
 * @param {number} [columnsConfig[].size] - Column width (in characters)
 * @param {boolean} [columnsConfig[].wrapText] - Whether to enable text wrapping for this column
 * @param {string} [filename="data.xlsx"] - Name of the downloaded file
 */
function downloadExcel(data, columnsConfig, filename = "data.xlsx") {
    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(columnsConfig) || columnsConfig.length === 0) {
        throw new Error("Invalid data format");
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
    
    // Apply cell styling for text wrapping
    // Find columns that need text wrapping
    const wrapColumns = columnsConfig
        .map((col, index) => ({ index, wrapText: col.wrapText }))
        .filter(col => col.wrapText)
        .map(col => col.index);
    
    // Apply text wrapping to cells in these columns
    if (wrapColumns.length > 0) {
        // For each row in the data (plus header row)
        for (let rowIndex = 0; rowIndex <= data.length; rowIndex++) {
            // Apply to each column that needs wrapping
            wrapColumns.forEach(colIndex => {
                // Convert row/col to cell address (A1, B2, etc.)
                const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                
                // Skip if cell doesn't exist
                if (!worksheet[cellAddress]) return;
                
                // Create style object if it doesn't exist
                if (!worksheet[cellAddress].s) {
                    worksheet[cellAddress].s = {};
                }
                
                // Set text wrapping and vertical alignment
                worksheet[cellAddress].s.alignment = {
                    wrapText: true,
                    vertical: "top"
                };
            });
        }
    }

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