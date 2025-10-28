import { Transaction } from '../types';

export const parseCSV = (file: File): Promise<Transaction[]> => {
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

      const header = rows.shift()!.toLowerCase().split(',').map(h => h.trim());
      
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

      const transactions: Transaction[] = rows.map((row, index) => {
        const values = row.split(',');
        const amount = parseFloat(values[amountIndex]);
        if (isNaN(amount)) {
            console.warn(`Skipping row ${index + 2} due to invalid amount.`);
            return null;
        }

        const date = new Date(values[dateIndex]);
        if (isNaN(date.getTime())) {
             console.warn(`Skipping row ${index + 2} due to invalid date.`);
            return null;
        }
        
        const type = values[typeIndex]?.trim().toLowerCase();
        if (type !== 'income' && type !== 'expense') {
            console.warn(`Skipping row ${index + 2} due to invalid type: '${values[typeIndex]}'. Must be 'income' or 'expense'.`);
            return null;
        }

        return {
          id: `${Date.now()}-${index}`,
          date: date,
          description: values[descriptionIndex]?.trim() || 'N/A',
          category: values[categoryIndex]?.trim() || 'Uncategorized',
          amount: Math.abs(amount),
          type: type as 'income' | 'expense',
        };
      }).filter((t): t is Transaction => t !== null);

      if (transactions.length === 0) {
        return reject(new Error('No valid transactions found in the file. Please check the data format.'));
      }

      resolve(transactions);
    };

    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };

    reader.readAsText(file);
  });
};
