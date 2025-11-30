// Helper to clean number string (persian numbers to english, remove currency symbols etc)
const cleanNumber = (str) => {
    if (!str) return 0;
    
    // Convert Persian/Arabic digits to English
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    
    let cleanStr = String(str);
    
    for(let i=0; i<10; i++) {
        cleanStr = cleanStr.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
    }
    
    // Remove all non-numeric chars except dot and minus
    cleanStr = cleanStr.replace(/[^0-9.-]/g, '');
    
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
};

// Parse CSV or Tab-separated text (Single sheet fallback)
const parseTextData = (text) => {
    if (!text || !text.trim()) return { sheets: [] };
    
    const firstLine = text.split('\n')[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    
    const rows = text.trim().split('\n').map(row => row.split(delimiter));
    const headers = rows[0].map(h => h.trim());
    const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] ? row[index].trim() : '';
        });
        return obj;
    });
    
    // Treat text input as a generic "Sheet1"
    return { 
        sheets: [{ name: 'Sheet1', headers, data }] 
    };
};

// Read Excel File using SheetJS - Reads ALL Sheets
const readExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                
                const sheets = workbook.SheetNames.map(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (jsonData.length === 0) return null;

                    const headers = jsonData[0].map(h => h ? String(h).trim() : '');
                    const rawRows = jsonData.slice(1);
                    
                    const rows = rawRows.map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] !== undefined ? row[index] : '';
                        });
                        return obj;
                    });

                    return { name: sheetName, headers, data: rows };
                }).filter(s => s !== null);
                
                resolve({ sheets });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

const summarizeData = (sheets) => {
    const groups = {};
    
    // Helper to identify sheet type
    const getSheetType = (name) => {
        const n = name.toLowerCase(); 
        if (n.includes('برگشت از فروش اعتباری') || n.includes('برگشت فروش اعتباری')) return 'return_credit';
        if (n.includes('برگشت از فروش') || n.includes('برگشت فروش')) return 'return_sale';
        if (n.includes('فروش اعتباری')) return 'sale_credit';
        if (n.includes('فروش')) return 'sale';
        return 'other';
    };

    let globalHeaders = [];
    
    sheets.forEach(sheet => {
        if (sheet.headers.length > globalHeaders.length) {
            globalHeaders = sheet.headers;
        }

        // Find columns
        const varietyCodeCol = sheet.headers.find(h => h.includes('کد تنوع')) || sheet.headers.find(h => h.includes('کد')) || sheet.headers[0];
        // Look for Variety Description
        const varietyDescCol = sheet.headers.find(h => h.includes('شرح تنوع')) || sheet.headers.find(h => h.includes('شرح')) || sheet.headers.find(h => h.includes('عنوان'));

        const debtorCol = sheet.headers.find(h => h.includes('بدهکار'));
        const creditorCol = sheet.headers.find(h => h.includes('بستانکار'));
        const countCol = sheet.headers.find(h => h.includes('تعداد')) || sheet.headers.find(h => h.includes('مقدار'));

        const sheetType = getSheetType(sheet.name);

        sheet.data.forEach(row => {
            const rawCode = row[varietyCodeCol];
            // 1. Filtering Rule: Must start with DKPC
            if (!rawCode || !String(rawCode).trim().toUpperCase().startsWith('DKPC')) {
                return; // Skip this row
            }

            const groupKey = String(rawCode).trim();
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    varietyCode: groupKey,
                    varietyDesc: varietyDescCol ? (row[varietyDescCol] || '') : '',
                    totalDebtor: 0,
                    totalCreditor: 0,
                    countSale: 0,
                    countSaleCredit: 0,
                    countReturn: 0,
                    countReturnCredit: 0,
                    netCount: 0,
                    totalRevenue: 0,
                    revenuePerUnit: 0
                };
            }

            // Update description if current row has one and stored one is empty
            if (!groups[groupKey].varietyDesc && varietyDescCol && row[varietyDescCol]) {
                groups[groupKey].varietyDesc = row[varietyDescCol];
            }

            // Sum Financials
            if (debtorCol) groups[groupKey].totalDebtor += cleanNumber(row[debtorCol]);
            if (creditorCol) groups[groupKey].totalCreditor += cleanNumber(row[creditorCol]);

            // Sum Counts
            const quantity = countCol ? cleanNumber(row[countCol]) : 1;

            if (sheetType === 'sale') groups[groupKey].countSale += quantity;
            else if (sheetType === 'sale_credit') groups[groupKey].countSaleCredit += quantity;
            else if (sheetType === 'return_sale') groups[groupKey].countReturn += quantity;
            else if (sheetType === 'return_credit') groups[groupKey].countReturnCredit += quantity;
        });
    });

    // Calculate Derived Metrics
    Object.values(groups).forEach(group => {
        group.netCount = (group.countSale + group.countSaleCredit) - (group.countReturn + group.countReturnCredit);
        
        // 3. Total Revenue = Creditor - Debtor
        group.totalRevenue = group.totalCreditor - group.totalDebtor;

        // 4. Revenue Per Unit = Total Revenue / Net Count
        if (group.netCount !== 0) {
            group.revenuePerUnit = Math.round(group.totalRevenue / group.netCount);
        } else {
            group.revenuePerUnit = 0;
        }
    });

    return {
        summary: Object.values(groups),
        varietyCodeCol: 'کد تنوع'
    };
};

// Export data to Excel
const exportToExcel = (data, fileName = 'summary.xlsx') => {
    const exportData = data.map(item => ({
        'کد تنوع': item.varietyCode,
        'شرح تنوع': item.varietyDesc,
        'تعداد خالص فروش': item.netCount,
        'درآمد کل (﷼)': item.totalRevenue,
        'درآمد واحد (﷼)': item.revenuePerUnit,
        'تعداد فروش': item.countSale,
        'تعداد فروش اعتباری': item.countSaleCredit,
        'تعداد برگشت از فروش': item.countReturn,
        'تعداد برگشت از فروش اعتباری': item.countReturnCredit,
        'جمع بستانکار (﷼)': item.totalCreditor,
        'جمع بدهکار (﷼)': item.totalDebtor,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
    XLSX.writeFile(workbook, fileName);
};