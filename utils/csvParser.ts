import { Transaction, MalformedRow } from '../types';

export const parseCSV = (file: File): Promise<{ validTransactions: Transaction[]; malformedRows: MalformedRow[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error('Failed to read file.'));
      }

      const content = event.target.result as string;
      const rows = content.split('\n').filter(row => row.trim() !== '');
       if (rows.length < 1) {
        return reject(new Error('CSV file is empty or contains only a header.'));
      }

      const headerRow = rows.shift()!;
      const header = headerRow.toLowerCase().split(',').map(h => h.trim());
      
      const dateIndex = header.indexOf('date');
      let descriptionIndex = header.indexOf('description');
      if (descriptionIndex === -1) {
        descriptionIndex = header.indexOf('transaction description');
      }
      const categoryIndex = header.indexOf('category');
      const amountIndex = header.indexOf('amount');
      const typeIndex = header.indexOf('type');

      if ([dateIndex, descriptionIndex, categoryIndex, amountIndex, typeIndex].includes(-1)) {
        const requiredHeaders = "date, Transaction Description (or description), category, amount, type";
        const missing = [];
        if (dateIndex === -1) missing.push('date');
        if (descriptionIndex === -1) missing.push('Transaction Description (or description)');
        if (categoryIndex === -1) missing.push('category');
        if (amountIndex === -1) missing.push('amount');
        if (typeIndex === -1) missing.push('type');
        return reject(new Error(`CSV must contain headers: ${requiredHeaders}. Missing: ${missing.join(', ')}.`));
      }

      const validTransactions: Transaction[] = [];
      const malformedRows: MalformedRow[] = [];

      rows.forEach((rowStr, index) => {
        const values = rowStr.split(',');
        const originalRow = [...values];
        
        const dateStr = values[dateIndex];
        const date = new Date(dateStr);
        if (!dateStr || isNaN(date.getTime())) {
            malformedRows.push({ row: originalRow, reason: "Invalid or Missing Date"});
            return;
        }

        const amountStr = values[amountIndex];
        const amount = parseFloat(amountStr);
        if (!amountStr || isNaN(amount)) {
            malformedRows.push({ row: originalRow, reason: "Invalid or Missing Amount"});
            return;
        }

        const type = values[typeIndex]?.trim().toLowerCase();
        if (type !== 'income' && type !== 'expense') {
            malformedRows.push({ row: originalRow, reason: "Invalid or Missing Type (must be 'income' or 'expense')"});
            return;
        }
        
        const description = values[descriptionIndex]?.trim();
        if (!description) {
           malformedRows.push({ row: originalRow, reason: "Missing Description"});
           return;
        }

        validTransactions.push({
          id: `${Date.now()}-${index}`,
          date: date,
          description: description,
          category: values[categoryIndex]?.trim() || 'Uncategorized',
          amount: Math.abs(amount),
          type: type as 'income' | 'expense',
        });
      });

      if (validTransactions.length === 0 && malformedRows.length > 0) {
        return reject(new Error('No valid transactions found. All rows had errors. Please check the file.'));
      }

      resolve({ validTransactions, malformedRows });
    };

    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };

    reader.readAsText(file);
  });
};