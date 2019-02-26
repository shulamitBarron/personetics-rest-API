import tables from '../models/Tables';
import {groupBy} from "./common";

export default (t: any , theTransactions: any[] = [] , accounts: any = [] , seriesNames = [] , periods = [] , selectedCategory = "") => {
    let table = {...tables[t]};
    let maxDate;
    const curDate = new Date("2019-02-28");
    switch (table.case) {
        case "transaction":
            maxDate = new Date(Math.max.apply(null , theTransactions.map(t => new Date(t.date))));
            const transaction = theTransactions.filter(t => new Date(t.date).getTime() === maxDate.getTime());
            table.rows = [table.cols.map(col => transaction[0] && transaction[0][col] ? transaction[0][col] : null)];
            break;
        case "transactions":
            table.rows = theTransactions.map(transaction => table.cols.map(col => transaction[col] ? transaction[col] : null));
            break;
        case "transactionCount":
            table.rows = [[theTransactions.length]];
            break;
        case "currentDate":
            table.rows = [[new Date("2019-02-28")]];
            break;
        case "accounts":
            table.rows = accounts.map(account => table.cols.map(col => account[col] ? account[col] : null));
            break;
        case "account":
            maxDate = new Date(Math.max.apply(null , theTransactions.map(t => new Date(t.date))));
            const trans = theTransactions.filter(t => new Date(t.date).getTime() === maxDate.getTime());
            const account = trans.length ? accounts.filter(a => a.number === trans[0].accountNumber) : null;
            table.rows = [table.cols.map(col => account[0] && account[0][col] ? account[0][col] : null)];
            break;
        case "seriesNames":
            table.rows = seriesNames;
            break;
        case "lastMonthDate":
            table.rows = [[(new Date((new Date).setMonth(curDate.getMonth() - 1)).getMonth() + 1).toString()]];
            break;
        case "hasSingleAccount":
            table.rows = [[(accounts.length === 1).toString()]];
            break;
        case "amount":
            theTransactions = theTransactions
                .filter(t => new Date(t.date).getMonth() === new Date("2019-02-28").getMonth())
                .map(t => +t.amount);
            table.rows = [[theTransactions.length ? theTransactions.reduce((a , b) => a + b) : 0]];
            break;
        case "localCurrencyCd":
            table.rows = [[theTransactions[0] && theTransactions[0].currencyCd]];
            break;
        case "barChartExpenses":
            const AccountTransactions = groupBy(theTransactions , item => [item.month , item.account]);
            const Accounts = groupBy(theTransactions , item => [item.account]).map(a => a[0].account);
            table.rows = AccountTransactions
                .map(At => [At[0].account ,
                    Math.abs(At.map(t => +t.amount).reduce((a , b) => a + b)) ,
                    At[0].month ,
                    At[0].currencyCd]);
            periods.forEach(p => Accounts.forEach(AT => !table.rows.find(a =>
                a[0] === AT && a[2] === p) ? table.rows.push([AT ,
                0.00 ,
                p ,
                theTransactions[0] && theTransactions[0].currencyCd]) : null))
            break;
        case "periods":
            table.rows = periods.map(p => [p]);
            break;
        case "bizCategories":
            theTransactions = theTransactions.map(t => t.categoryDescription.en);
            const categoryDescriptions = theTransactions.filter((t , i) => theTransactions.indexOf(t) === i);
            table.rows = categoryDescriptions.map(g => [g]);
            break;
        case "categoryGroup":
            table.rows = [["CG10000" , {"en": selectedCategory}]];
            break;
        case "quizRanges":
            const avg = theTransactions.length ? Math.abs(theTransactions.map(t => +t.amount).reduce((a , b) => a + b) / periods.length) : 0;
            let random = Math.floor(Math.random() * 2000) + avg - 2000;
            random = random < 0 ? 0 : random;
            const range = [];
            for (let i = 0; i < 4; i++) {
                range.push([i.toString() , (random + 500 * i).toString() , (random + 500 * (i + 1)).toString() , (avg > random + 500 * i && avg < random + 500 * (i + 1)).toString()])
            }
            table.rows = range;
            break;
        default:
            break;
    }

    delete table.case;
    return table;
}
