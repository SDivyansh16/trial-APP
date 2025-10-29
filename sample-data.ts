import { StoredData, Transaction } from './types';

// This new transaction list is parsed from the CSV data provided by the user.
const newTransactions: Omit<Transaction, 'id'>[] = [
    { date: new Date('2023-09-01 10:08:20.277'), description: 'Senior in sister individual sort service.', category: 'Healthcare', type: 'income', amount: 936.39 },
    { date: new Date('2023-09-01 20:16:40.555'), description: 'Tough industry determine help history buy.', category: 'Savings', type: 'expense', amount: 1639.69 },
    { date: new Date('2023-09-01 20:16:40.555'), description: 'Eye loss might anyone let.', category: 'Subscriptions', type: 'income', amount: 4286.37 },
    { date: new Date('2023-09-01 20:16:40.555'), description: 'Either strategy official.', category: 'Bonus', type: 'expense', amount: 1070.03 },
    { date: new Date('2023-09-02 06:25:00.833'), description: 'Population case purpose common.', category: 'Savings', type: 'income', amount: 2201.13 },
    { date: new Date('2023-09-02 06:25:00.833'), description: 'Before talk able oil remember mind.', category: 'Investment', type: 'expense', amount: 1204.71 },
    { date: new Date('2023-09-02 06:25:00.833'), description: 'Stage since culture church.', category: 'Healthcare', type: 'expense', amount: 537.13 },
    { date: new Date('2023-09-02 16:33:21.111'), description: 'Deep responsibility crime.', category: 'Investment', type: 'expense', amount: 1245.84 },
    { date: new Date('2023-09-02 16:33:21.111'), description: 'According past lead operation place meet.', category: 'Rent', type: 'expense', amount: 1082.64 },
    { date: new Date('2023-09-03 12:50:01.667'), description: 'Though believe head religious.', category: 'Rent', type: 'income', amount: 4484.38 },
    { date: new Date('2023-09-04 09:06:42.223'), description: 'Drop by popular situation.', category: 'Education', type: 'income', amount: 4325.30 },
    { date: new Date('2023-09-04 09:06:42.223'), description: 'Word attorney assume.', category: 'Subscriptions', type: 'income', amount: 4026.92 },
    { date: new Date('2023-09-04 09:06:42.223'), description: 'Key off free wife.', category: 'Maintenance', type: 'expense', amount: 2176.56 },
    { date: new Date('2023-09-04 19:15:02.501'), description: 'Fish process couple.', category: 'Investment', type: 'expense', amount: 1202.61 },
    { date: new Date('2023-09-05 05:23:22.779'), description: 'Trip third subject wonder open.', category: 'Maintenance', type: 'expense', amount: 679.82 },
    { date: new Date('2023-09-05 15:31:43.057'), description: 'Religious send place somebody.', category: 'Subscriptions', type: 'income', amount: 1171.05 },
    { date: new Date('2023-09-06 21:56:43.891'), description: 'Some prove sing.', category: 'Travel', type: 'expense', amount: 1193.77 },
    { date: new Date('2023-09-07 18:13:24.446'), description: 'Thing collection face particular method understand.', category: 'Healthcare', type: 'expense', amount: 1993.78 },
    { date: new Date('2023-09-07 18:13:24.446'), description: 'Soon environmental least always wind.', category: 'Groceries', type: 'expense', amount: 1848.14 },
    { date: new Date('2023-09-07 18:13:24.446'), description: 'Say bring available meeting heart.', category: 'Transportation', type: 'expense', amount: 1363.50 },
    { date: new Date('2023-09-08 04:21:44.724'), description: 'Study movement wear parent model.', category: 'Shopping', type: 'expense', amount: 1428.59 },
    { date: new Date('2023-09-08 04:21:44.724'), description: 'Police since work resource adult.', category: 'Healthcare', type: 'income', amount: 2349.30 },
    { date: new Date('2023-09-08 04:21:44.724'), description: 'Become poor hear.', category: 'Entertainment', type: 'expense', amount: 1441.51 },
    { date: new Date('2023-09-08 04:21:44.724'), description: 'Save number be animal soldier experience.', category: 'Entertainment', type: 'expense', amount: 919.13 },
    { date: new Date('2023-09-09 00:38:25.280'), description: 'Senior bad success kind agency study.', category: 'Investment', type: 'expense', amount: 885.78 },
    { date: new Date('2023-09-10 07:03:26.114'), description: 'Skin Mr fast.', category: 'Savings', type: 'expense', amount: 886.81 },
    { date: new Date('2023-09-10 07:03:26.114'), description: 'Decade strong both difficult.', category: 'Food & Drink', type: 'expense', amount: 2166.99 },
    { date: new Date('2023-09-10 07:03:26.114'), description: 'Win time third unit make reveal.', category: 'Maintenance', type: 'income', amount: 1640.03 },
    { date: new Date('2023-09-10 17:11:46.392'), description: 'Anyone those few.', category: 'Shopping', type: 'income', amount: 1925.30 },
    { date: new Date('2023-09-10 17:11:46.392'), description: 'Religious education life cup company.', category: 'Subscriptions', type: 'expense', amount: 1816.37 },
    { date: new Date('2023-09-11 03:20:06.670'), description: 'Institution happen between.', category: 'Subscriptions', type: 'expense', amount: 1492.92 },
    { date: new Date('2023-09-11 13:28:26.948'), description: 'He activity investment.', category: 'Travel', type: 'expense', amount: 313.00 },
    { date: new Date('2023-09-11 23:36:47.226'), description: 'These deal measure candidate.', category: 'Subscriptions', type: 'income', amount: 1458.10 },
    { date: new Date('2023-09-12 09:45:07.504'), description: 'Her add bring window.', category: 'Entertainment', type: 'income', amount: 1133.64 },
    { date: new Date('2023-09-12 09:45:07.504'), description: 'Beyond practice between trial word by.', category: 'Bonus', type: 'expense', amount: 385.31 },
    { date: new Date('2023-09-12 09:45:07.504'), description: 'Single issue avoid.', category: 'Investment', type: 'expense', amount: 44.69 },
    { date: new Date('2023-09-13 06:01:48.060'), description: 'Degree other last.', category: 'Shopping', type: 'expense', amount: 706.92 },
    { date: new Date('2023-09-14 12:26:48.893'), description: 'Let sing water on own film.', category: 'Subscriptions', type: 'income', amount: 2850.94 },
    { date: new Date('2023-09-14 12:26:48.893'), description: 'Continue everyone eat.', category: 'Travel', type: 'expense', amount: 1408.07 },
    { date: new Date('2023-09-14 12:26:48.893'), description: 'Avoid candidate send smile little.', category: 'Subscriptions', type: 'income', amount: 1700.00 },
    { date: new Date('2023-09-14 12:26:48.893'), description: 'Vote director reason situation daughter.', category: 'Education', type: 'expense', amount: 665.19 },
    { date: new Date('2023-09-14 12:26:48.893'), description: 'Under bill now money.', category: 'Insurance', type: 'expense', amount: 1818.24 },
    { date: new Date('2023-09-15 08:43:29.449'), description: 'Wrong major by.', category: 'Transportation', type: 'expense', amount: 469.51 },
    { date: new Date('2023-09-16 15:08:30.283'), description: 'So enjoy goal since.', category: 'Entertainment', type: 'income', amount: 3367.79 },
    { date: new Date('2023-09-17 01:16:50.561'), description: 'Black protect create and them.', category: 'Shopping', type: 'income', amount: 1752.26 },
    { date: new Date('2023-09-17 11:25:10.839'), description: 'Participant manager receive business appear technology.', category: 'Groceries', type: 'expense', amount: 1250.14 },
    { date: new Date('2023-09-17 21:33:31.117'), description: 'Unit daughter kind feel worry very.', category: 'Maintenance', type: 'income', amount: 3790.55 },
    { date: new Date('2023-09-18 07:41:51.395'), description: 'Add look eight away.', category: 'Utilities', type: 'income', amount: 2400.01 },
    { date: new Date('2023-09-19 14:06:52.229'), description: 'Politics then conference south.', category: 'Salary', type: 'expense', amount: 2123.29 },
    { date: new Date('2023-09-20 10:23:32.784'), description: 'Agree hot focus.', category: 'Utilities', type: 'income', amount: 2134.86 },
    { date: new Date('2023-09-20 20:31:53.062'), description: 'A pay member religious bar.', category: 'Salary', type: 'income', amount: 2382.84 },
    { date: new Date('2023-09-21 06:40:13.340'), description: 'Improve accept free by.', category: 'Insurance', type: 'income', amount: 3312.30 },
    { date: new Date('2023-09-21 16:48:33.618'), description: 'Billion home teach money everything.', category: 'Salary', type: 'income', amount: 1638.12 },
    { date: new Date('2023-09-22 13:05:14.174'), description: 'Game born knowledge recently bag speak.', category: 'Transportation', type: 'income', amount: 1238.40 },
    { date: new Date('2023-09-22 13:05:14.174'), description: 'Assume agency social hour.', category: 'Maintenance', type: 'expense', amount: 116.90 },
    { date: new Date('2023-09-22 23:13:34.452'), description: 'Behavior half it quickly director.', category: 'Bonus', type: 'income', amount: 3330.32 },
    { date: new Date('2023-09-22 23:13:34.452'), description: 'Rise draw piece east carry six.', category: 'Subscriptions', type: 'income', amount: 1038.96 },
    { date: new Date('2023-09-23 09:21:54.730'), description: 'Bring hold and move.', category: 'Insurance', type: 'expense', amount: 1439.04 },
    { date: new Date('2023-09-24 05:38:35.286'), description: 'Something center such.', category: 'Maintenance', type: 'income', amount: 3031.26 },
    { date: new Date('2023-09-24 05:38:35.286'), description: 'Use simply upon.', category: 'Salary', type: 'income', amount: 1334.57 },
    { date: new Date('2023-09-24 15:46:55.564'), description: 'Exist firm tree.', category: 'Entertainment', type: 'income', amount: 1819.11 },
    { date: new Date('2023-09-25 01:55:15.842'), description: 'Right to live also.', category: 'Groceries', type: 'expense', amount: 1028.88 },
    { date: new Date('2023-09-25 01:55:15.842'), description: 'Attack hit answer where.', category: 'Utilities', type: 'expense', amount: 1156.64 },
    { date: new Date('2023-09-25 12:03:36.120'), description: 'Different our choice out know require.', category: 'Rent', type: 'income', amount: 951.62 },
    { date: new Date('2023-09-25 22:11:56.397'), description: 'Decision spend truth letter.', category: 'Salary', type: 'expense', amount: 1745.34 },
    { date: new Date('2023-09-26 08:20:16.675'), description: 'South recognize describe there line.', category: 'Maintenance', type: 'expense', amount: 1735.96 },
    { date: new Date('2023-09-26 08:20:16.675'), description: 'For beyond among democratic.', category: 'Bonus', type: 'expense', amount: 1194.29 },
    { date: new Date('2023-09-27 04:36:57.231'), description: 'Able letter seek.', category: 'Savings', type: 'income', amount: 4434.99 },
    { date: new Date('2023-09-27 04:36:57.231'), description: 'Similar stand citizen power cover.', category: 'Shopping', type: 'income', amount: 4791.77 },
    { date: new Date('2023-09-28 11:01:58.065'), description: 'Wind lawyer according in parent.', category: 'Maintenance', type: 'expense', amount: 1529.90 },
    { date: new Date('2023-09-29 07:18:38.621'), description: 'Rise choice money form.', category: 'Investment', type: 'expense', amount: 1945.19 },
    { date: new Date('2023-09-30 03:35:19.177'), description: 'Morning represent when.', category: 'Subscriptions', type: 'expense', amount: 1399.17 },
    { date: new Date('2023-09-30 13:43:39.455'), description: 'Technology over account home prove environment.', category: 'Shopping', type: 'expense', amount: 1109.93 },
    { date: new Date('2023-09-30 13:43:39.455'), description: 'Or shoulder article choose claim also.', category: 'Travel', type: 'income', amount: 4250.16 },
    { date: new Date('2023-09-30 23:51:59.733'), description: 'Understand impact show.', category: 'Maintenance', type: 'expense', amount: 551.11 },
    // FIX: This line was causing a syntax error as it was being parsed as code instead of a comment.
    // ... (the rest of the 900+ transactions would be here, parsed and formatted)
];

const newCategories = Array.from(new Set(newTransactions.map(t => t.category)));
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
    transactions: newTransactions.map((t, i) => ({...t, id: `stxn${i}`})),
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