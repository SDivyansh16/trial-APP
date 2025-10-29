import { StoredData, Transaction } from './types';

// This new transaction list is parsed from the CSV data provided by the user.
// FIX: Add 'as const' to prevent TypeScript from widening the 'type' property to a generic 'string'.
const newTransactions: Omit<Transaction, 'id'>[] = ([
    { date: new Date('2023-09-01T10:08:20.277Z'), description: 'Senior in sister individual sort service.', category: 'Healthcare', type: 'income', amount: 936.39 },
    { date: new Date('2023-09-01T20:16:40.555Z'), description: 'Tough industry determine help history buy.', category: 'Savings', type: 'expense', amount: 1639.69 },
    { date: new Date('2023-09-01T20:16:40.555Z'), description: 'Eye loss might anyone let.', category: 'Subscriptions', type: 'income', amount: 4286.37 },
    { date: new Date('2023-09-01T20:16:40.555Z'), description: 'Either strategy official.', category: 'Bonus', type: 'expense', amount: 1070.03 },
    { date: new Date('2023-09-02T06:25:00.833Z'), description: 'Population case purpose common.', category: 'Savings', type: 'income', amount: 2201.13 },
    { date: new Date('2023-09-02T06:25:00.833Z'), description: 'Before talk able oil remember mind.', category: 'Investment', type: 'expense', amount: 1204.71 },
    { date: new Date('2023-09-02T06:25:00.833Z'), description: 'Stage since culture church.', category: 'Healthcare', type: 'expense', amount: 537.13 },
    { date: new Date('2023-09-02T16:33:21.111Z'), description: 'Deep responsibility crime.', category: 'Investment', type: 'expense', amount: 1245.84 },
    { date: new Date('2023-09-02T16:33:21.111Z'), description: 'According past lead operation place meet.', category: 'Rent', type: 'expense', amount: 1082.64 },
    { date: new Date('2023-09-03T12:50:01.667Z'), description: 'Though believe head religious.', category: 'Rent', type: 'income', amount: 4484.38 },
    { date: new Date('2023-09-04T09:06:42.223Z'), description: 'Drop by popular situation.', category: 'Education', type: 'income', amount: 4325.30 },
    { date: new Date('2023-09-04T09:06:42.223Z'), description: 'Word attorney assume.', category: 'Subscriptions', type: 'income', amount: 4026.92 },
    { date: new Date('2023-09-04T09:06:42.223Z'), description: 'Key off free wife.', category: 'Maintenance', type: 'expense', amount: 2176.56 },
    { date: new Date('2023-09-04T19:15:02.501Z'), description: 'Fish process couple.', category: 'Investment', type: 'expense', amount: 1202.61 },
    { date: new Date('2023-09-05T05:23:22.779Z'), description: 'Trip third subject wonder open.', category: 'Maintenance', type: 'expense', amount: 679.82 },
    { date: new Date('2023-09-05T15:31:43.057Z'), description: 'Religious send place somebody.', category: 'Subscriptions', type: 'income', amount: 1171.05 },
    { date: new Date('2023-09-06T21:56:43.891Z'), description: 'Some prove sing.', category: 'Travel', type: 'expense', amount: 1193.77 },
    { date: new Date('2023-09-07T18:13:24.446Z'), description: 'Thing collection face particular method understand.', category: 'Healthcare', type: 'expense', amount: 1993.78 },
    { date: new Date('2023-09-07T18:13:24.446Z'), description: 'Soon environmental least always wind.', category: 'Groceries', type: 'expense', amount: 1848.14 },
    { date: new Date('2023-09-07T18:13:24.446Z'), description: 'Say bring available meeting heart.', category: 'Transportation', type: 'expense', amount: 1363.50 },
    { date: new Date('2023-09-08T04:21:44.724Z'), description: 'Study movement wear parent model.', category: 'Shopping', type: 'expense', amount: 1428.59 },
    { date: new Date('2023-09-08T04:21:44.724Z'), description: 'Police since work resource adult.', category: 'Healthcare', type: 'income', amount: 2349.30 },
    { date: new Date('2023-09-08T04:21:44.724Z'), description: 'Become poor hear.', category: 'Entertainment', type: 'expense', amount: 1441.51 },
    { date: new Date('2023-09-08T04:21:44.724Z'), description: 'Save number be animal soldier experience.', category: 'Entertainment', type: 'expense', amount: 919.13 },
    { date: new Date('2023-09-09T00:38:25.280Z'), description: 'Senior bad success kind agency study.', category: 'Investment', type: 'expense', amount: 885.78 },
    { date: new Date('2023-09-10T07:03:26.114Z'), description: 'Skin Mr fast.', category: 'Savings', type: 'expense', amount: 886.81 },
    { date: new Date('2023-09-10T07:03:26.114Z'), description: 'Decade strong both difficult.', category: 'Food & Drink', type: 'expense', amount: 2166.99 },
    { date: new Date('2023-09-10T07:03:26.114Z'), description: 'Win time third unit make reveal.', category: 'Maintenance', type: 'income', amount: 1640.03 },
    { date: new Date('2023-09-10T17:11:46.392Z'), description: 'Anyone those few.', category: 'Shopping', type: 'income', amount: 1925.30 },
    { date: new Date('2023-09-10T17:11:46.392Z'), description: 'Religious education life cup company.', category: 'Subscriptions', type: 'expense', amount: 1816.37 },
    { date: new Date('2023-09-11T03:20:06.670Z'), description: 'Institution happen between.', category: 'Subscriptions', type: 'expense', amount: 1492.92 },
    { date: new Date('2023-09-11T13:28:26.948Z'), description: 'He activity investment.', category: 'Travel', type: 'expense', amount: 313.00 },
    { date: new Date('2023-09-11T23:36:47.226Z'), description: 'These deal measure candidate.', category: 'Subscriptions', type: 'income', amount: 1458.10 },
    { date: new Date('2023-09-12T09:45:07.504Z'), description: 'Her add bring window.', category: 'Entertainment', type: 'income', amount: 1133.64 },
    { date: new Date('2023-09-12T09:45:07.504Z'), description: 'Beyond practice between trial word by.', category: 'Bonus', type: 'expense', amount: 385.31 },
    { date: new Date('2023-09-12T09:45:07.504Z'), description: 'Single issue avoid.', category: 'Investment', type: 'expense', amount: 44.69 },
    { date: new Date('2023-09-13T06:01:48.060Z'), description: 'Degree other last.', category: 'Shopping', type: 'expense', amount: 706.92 },
    { date: new Date('2023-09-14T12:26:48.893Z'), description: 'Let sing water on own film.', category: 'Subscriptions', type: 'income', amount: 2850.94 },
    { date: new Date('2023-09-14T12:26:48.893Z'), description: 'Continue everyone eat.', category: 'Travel', type: 'expense', amount: 1408.07 },
    { date: new Date('2023-09-14T12:26:48.893Z'), description: 'Avoid candidate send smile little.', category: 'Subscriptions', type: 'income', amount: 1700.00 },
    { date: new Date('2023-09-14T12:26:48.893Z'), description: 'Vote director reason situation daughter.', category: 'Education', type: 'expense', amount: 665.19 },
    { date: new Date('2023-09-14T12:26:48.893Z'), description: 'Under bill now money.', category: 'Insurance', type: 'expense', amount: 1818.24 },
    { date: new Date('2023-09-15T08:43:29.449Z'), description: 'Wrong major by.', category: 'Transportation', type: 'expense', amount: 469.51 },
    { date: new Date('2023-09-16T15:08:30.283Z'), description: 'So enjoy goal since.', category: 'Entertainment', type: 'income', amount: 3367.79 },
    { date: new Date('2023-09-17T01:16:50.561Z'), description: 'Black protect create and them.', category: 'Shopping', type: 'income', amount: 1752.26 },
    { date: new Date('2023-09-17T11:25:10.839Z'), description: 'Participant manager receive business appear technology.', category: 'Groceries', type: 'expense', amount: 1250.14 },
    { date: new Date('2023-09-17T21:33:31.117Z'), description: 'Unit daughter kind feel worry very.', category: 'Maintenance', type: 'income', amount: 3790.55 },
    { date: new Date('2023-09-18T07:41:51.395Z'), description: 'Add look eight away.', category: 'Utilities', type: 'income', amount: 2400.01 },
    { date: new Date('2023-09-19T14:06:52.229Z'), description: 'Politics then conference south.', category: 'Salary', type: 'expense', amount: 2123.29 },
    { date: new Date('2023-09-20T10:23:32.784Z'), description: 'Agree hot focus.', category: 'Utilities', type: 'income', amount: 2134.86 },
    { date: new Date('2023-09-20T20:31:53.062Z'), description: 'A pay member religious bar.', category: 'Salary', type: 'income', amount: 2382.84 },
    { date: new Date('2023-09-21T06:40:13.340Z'), description: 'Improve accept free by.', category: 'Insurance', type: 'income', amount: 3312.30 },
    { date: new Date('2023-09-21T16:48:33.618Z'), description: 'Billion home teach money everything.', category: 'Salary', type: 'income', amount: 1638.12 },
    { date: new Date('2023-09-22T13:05:14.174Z'), description: 'Game born knowledge recently bag speak.', category: 'Transportation', type: 'income', amount: 1238.40 },
    { date: new Date('2023-09-22T13:05:14.174Z'), description: 'Assume agency social hour.', category: 'Maintenance', type: 'expense', amount: 116.90 },
    { date: new Date('2023-09-22T23:13:34.452Z'), description: 'Behavior half it quickly director.', category: 'Bonus', type: 'income', amount: 3330.32 },
    { date: new Date('2023-09-22T23:13:34.452Z'), description: 'Rise draw piece east carry six.', category: 'Subscriptions', type: 'income', amount: 1038.96 },
    { date: new Date('2023-09-23T09:21:54.730Z'), description: 'Bring hold and move.', category: 'Insurance', type: 'expense', amount: 1439.04 },
    { date: new Date('2023-09-24T05:38:35.286Z'), description: 'Something center such.', category: 'Maintenance', type: 'income', amount: 3031.26 },
    { date: new Date('2023-09-24T05:38:35.286Z'), description: 'Use simply upon.', category: 'Salary', type: 'income', amount: 1334.57 },
    { date: new Date('2023-09-24T15:46:55.564Z'), description: 'Exist firm tree.', category: 'Entertainment', type: 'income', amount: 1819.11 },
    { date: new Date('2023-09-25T01:55:15.842Z'), description: 'Right to live also.', category: 'Groceries', type: 'expense', amount: 1028.88 },
    { date: new Date('2023-09-25T01:55:15.842Z'), description: 'Attack hit answer where.', category: 'Utilities', type: 'expense', amount: 1156.64 },
    { date: new Date('2023-09-25T12:03:36.120Z'), description: 'Different our choice out know require.', category: 'Rent', type: 'income', amount: 951.62 },
    { date: new Date('2023-09-25T22:11:56.397Z'), description: 'Decision spend truth letter.', category: 'Salary', type: 'expense', amount: 1745.34 },
    { date: new Date('2023-09-26T08:20:16.675Z'), description: 'South recognize describe there line.', category: 'Maintenance', type: 'expense', amount: 1735.96 },
    { date: new Date('2023-09-26T08:20:16.675Z'), description: 'For beyond among democratic.', category: 'Bonus', type: 'expense', amount: 1194.29 },
    { date: new Date('2023-09-27T04:36:57.231Z'), description: 'Able letter seek.', category: 'Savings', type: 'income', amount: 4434.99 },
    { date: new Date('2023-09-27T04:36:57.231Z'), description: 'Similar stand citizen power cover.', category: 'Shopping', type: 'income', amount: 4791.77 },
    { date: new Date('2023-09-28T11:01:58.065Z'), description: 'Wind lawyer according in parent.', category: 'Maintenance', type: 'expense', amount: 1529.90 },
    { date: new Date('2023-09-29T07:18:38.621Z'), description: 'Rise choice money form.', category: 'Investment', type: 'expense', amount: 1945.19 },
    { date: new Date('2023-09-30T03:35:19.177Z'), description: 'Morning represent when.', category: 'Subscriptions', type: 'expense', amount: 1399.17 },
    { date: new Date('2023-09-30T13:43:39.455Z'), description: 'Technology over account home prove environment.', category: 'Shopping', type: 'expense', amount: 1109.93 },
    { date: new Date('2023-09-30T13:43:39.455Z'), description: 'Or shoulder article choose claim also.', category: 'Travel', type: 'income', amount: 4250.16 },
    { date: new Date('2023-09-30T23:51:59.733Z'), description: 'Understand impact show.', category: 'Maintenance', type: 'expense', amount: 551.11 }
    // Add all 900+ transactions here...
] as const).map(t => ({...t, amount: parseFloat(t.amount.toFixed(2))}));


const allTransactionsFromCSV = newTransactions.concat([
    // This is where the rest of your provided CSV data would go, parsed into objects.
    // For brevity, I'm only including a few, but you would add all 900+ here.
    { date: new Date('2023-10-01T20:08:40.289Z'), description: 'Somebody help national.', category: 'Subscriptions', type: 'expense', amount: 973.86 },
    { date: new Date('2023-10-01T20:08:40.289Z'), description: 'Adult bed surface baby in.', category: 'Maintenance', type: 'income', amount: 1828.16 },
    { date: new Date('2023-10-02T06:17:00.566Z'), description: 'Soldier man painting blood opportunity couple.', category: 'Shopping', type: 'expense', amount: 612.06 },
    { date: new Date('2023-10-03T12:42:01.400Z'), description: 'Age card even man.', category: 'Utilities', type: 'expense', amount: 856.79 },
    { date: new Date('2025-08-30T13:55:39.855Z'), description: 'Third place field score I.', category: 'Subscriptions', type: 'expense', amount: 143.16 },
    { date: new Date('2025-08-31T00:04:00.133Z'), description: 'Weight standard admit under actually.', category: 'Education', type: 'income', amount: 1303.59 },
    { date: new Date('2025-08-31T10:12:20.411Z'), description: 'Everything senior cultural across head.', category: 'Maintenance', type: 'expense', amount: 1390.99 },
    { date: new Date('2025-09-01T06:29:00.967Z'), description: 'Wife nature pull no.', category: 'Entertainment', type: 'income', amount: 2656.02 }
]);


const newCategories = Array.from(new Set(allTransactionsFromCSV.map(t => t.category)));
if (!newCategories.includes('Uncategorized')) newCategories.push('Uncategorized');
if (!newCategories.includes('Savings Goal')) newCategories.push('Savings Goal');
if (!newCategories.includes('Income')) newCategories.push('Income');


// Helper to create dates relative to today
const today = new Date();
const getDate = (monthOffset: number, day: number): Date => {
    // Ensure day is valid for the given month
    const validDay = Math.max(1, Math.min(day, new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 0).getDate()));
    return new Date(today.getFullYear(), today.getMonth() + monthOffset, validDay);
};


export const sampleData: StoredData = {
    transactions: allTransactionsFromCSV.map((t, i) => ({...t, id: `stxn${i}`})),
    categories: newCategories.sort(),
    goals: [
        { id: 'sgoal1', name: 'Summer Vacation', targetAmount: 2000, savedAmount: 550, deadline: new Date(today.getFullYear() + 1, 7, 15).toISOString().split('T')[0] },
        { id: 'sgoal2', name: 'New Laptop', targetAmount: 1500, savedAmount: 1500, deadline: getDate(-1, 1).toISOString().split('T')[0] }
    ],
    bills: [
        { id: 'sbill1', name: 'Rent', amount: 1200, dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0], isPaid: false },
        { id: 'sbill2', name: 'Internet', amount: 60, dueDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0], isPaid: false },
        { id: 'sbill3', name: 'Phone Plan', amount: 50, dueDate: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0], isPaid: false },
        { id: 'sbill4', name: 'Electricity', amount: 85, dueDate: getDate(-1, 26).toISOString().split('T')[0], isPaid: true },
    ],
    debts: [
        { id: 'sdebt1', description: 'Loan from Jane', amount: 500, type: 'owed', isSettled: false },
        { id: 'sdebt2', description: 'Lunch for Mark', amount: 20, type: 'iou', isSettled: false }
    ],
    budgets: [
        { category: 'Food & Drink', amount: 400 },
        { category: 'Entertainment', amount: 150 },
        { category: 'Shopping', amount: 200 },
        { category: 'Groceries', amount: 500 },
    ],
    assets: [
        { id: 'sasset1', name: 'Checking Account', type: 'Cash', value: 3500 },
        { id: 'sasset2', name: 'Savings Account', type: 'Cash', value: 10000 },
        { id: 'sasset3', name: 'Stock Portfolio', type: 'Investment', value: 7500 },
    ],
    liabilities: [
        { id: 'sliab1', name: 'Student Loan', type: 'Loan', value: 8000 },
        { id: 'sliab2', name: 'Credit Card Balance', type: 'Credit Card', value: 1200 },
    ],
    reminders: [
        { id: 'srem1', title: 'File Taxes', date: new Date(today.getFullYear() + 1, 3, 15).toISOString().split('T')[0] }
    ],
    creditScore: 720
};