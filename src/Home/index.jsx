import { useEffect, useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';



import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./style.css";

function Home() {
  const [formDetails, setFormDetails] = useState({
    transaction: "",
    amount: "",
    date: "",
    type: "income",
  });
  const [formVisible, setFormVisble] = useState(false);
  const [transactions, setTransactions] = useState(() => {
    const savedTransaction = localStorage.getItem("trans");
    return savedTransaction ? JSON.parse(savedTransaction) : [];
  });

  const [active, setActive] = useState("DAILY");
  const [monthWise, setMonthWise] = useState({});

  const [searchInput, setSearchInput] = useState("");
    
  const [value,onChange] = useState(new Date(),new Date())

  console.log(value)



  const submit = (e) => {
    e.preventDefault();

    setFormVisble(false);
    setTransactions((prev) => [...prev, formDetails]);

    setFormDetails({
      transaction: "",
      amount: "",
      date: "",
      type: "income",
    });
  };

  useEffect(() => {
    localStorage.setItem("trans", JSON.stringify(transactions));
  }, [transactions]);

  const transactionWithDay = transactions.map((t) => ({
    ...t,
    day: t.date
      ? new Date(t.date).toLocaleDateString("en-US", { weekday: "short" })
      : "",
  }));
  // console.log(transactionWithDay)

  const chartData = transactionWithDay.map((t) => ({
    ...t,
    income: t.type === "income" ? Number(t.amount) : 0,
    expense: t.type === "expense" ? Number(t.amount) : 0,
  }));

  const formattedData = chartData.map((item) => ({
    day: item.day,
    income: item.income ?? 0,
    expense: item.expense ?? 0,
  }));

  const mergeData = formattedData.reduce((acc, curr) => {
    const found = acc.find((item) => item.day === curr.day);

    if (found) {
      found.income += curr.income;
      found.expense += curr.expense;
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);

  const incomeTotal = transactions
    .filter((item) => item.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const expenseTotal = transactions
    .filter((item) => item.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = incomeTotal - expenseTotal;
  // console.log(balance)

  const handleOnClick = (e) => {
    if (e.target.tagName === "P") {
      setActive(e.target.dataset.value);
    }
  };

  const handleDelete = (index) => {
    const updatedTransaction = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransaction);
  };
  console.log(transactions);
  // const date = transactions.map((item)=>new Date(item.date).getMonth())

  const handleMonthWise = () => {
    const monthly = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      console.log(date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(transaction);
      return acc;
    }, {});
    setMonthWise(monthly);
  };
  console.log(monthWise);
  useEffect(() => {
    console.log("monthWise updated:", monthWise);
  }, [monthWise]);

  const yearWise = {};
  Object.entries(monthWise).forEach(([monthKey, transactions]) => {
    const [year] = monthKey.split("-");
    if (!yearWise[year]) {
      yearWise[year] = [];
    }
    yearWise[year].push(...transactions);
  });

  const month_name = {
    "01": "jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "june",
    "07": "july",
    "08": "Aug",
    "09": "sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };
  console.log(Object.entries(monthWise));

  const openSearchDialog = () => {
    const dialog = document.getElementById("searchDialog");
    if (dialog) {
      dialog.showModal();
    }
  };

  const closeDialog = () => {
    const dialog = document.getElementById("searchDialog");
    if (dialog) {
      dialog.close();
    }
  };

  

  // if (filteredData.length === 0){
  //   return<p>no data found</p>
  // }
  //filter data by range 

  function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

 const filteredData = transactions.filter((item) => {

      const matchedSearch =String(item.transaction || "")
      .toLowerCase()
      .includes(searchInput.toLowerCase())

  const txnDate = normalizeDate(new Date(item.date));
  const start = Array.isArray(value) && value[0] ? normalizeDate(new Date(value[0])) : null;
  const end = Array.isArray(value) && value[1] ? normalizeDate(new Date(value[1])) : null;

   const matchedDate =(!start || txnDate >= start) && (!end || txnDate <= end);
   return matchedSearch &&matchedDate
});



  return (
    <>
      <div className="Home-container">
        <header className="header">
          <img src="/icon/83-menu-2.png" alt="menu" className="icon" />
          <h2 className="tracker-heading">Daily Expense Tracker</h2>
          <img
            src="/icon/Search.png"
            alt="search"
            className="icon"
            onClick={openSearchDialog}
          />
        </header>
        <dialog id="searchDialog" className="search-box">
          <button
            style={{ position: "absolute", right: 5, top: 5, display: "block" }}
            onClick={closeDialog}
          >
            X
          </button>
          <input
            type="search"
            placeholder="enter search item"
            className="input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </dialog>

        {formVisible && (
          <div className="popup-overlay">
            <form className="form-container" onSubmit={submit}>
              <label htmlFor="transaction">Transaction</label>
              <input
                required
                id="transaction"
                type="text"
                name="transaction"
                value={formDetails.transaction}
                onChange={(e) =>
                  setFormDetails((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
              <label htmlFor="transaction-amount">Transaction Amount</label>
              <input
                required
                id="transaction-amount"
                type="number"
                name="amount"
                value={formDetails.amount}
                onChange={(e) =>
                  setFormDetails((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
              <label htmlFor="date">Date</label>
              <input
                required
                id="date"
                type="date"
                name="date"
                value={formDetails.date}
                onChange={(e) =>
                  setFormDetails((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
              <label htmlFor="income-type">IncomeType</label>
              <select
                className="income-type"
                id="income-type"
                name="type"
                value={formDetails.type}
                onChange={(e) =>
                  setFormDetails((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              >
                <option value="income">Income</option>
                <option value="expense">expense</option>
              </select>
              <button className="submit-button" type="submit">
                submit
              </button>
            </form>
          </div>
        )}
        <div className="balance">
          <h2 className="balance-text">Balance</h2>
          <div className="balance-amount">
            <h2 className={balance > 0 ? "positive-text" : "negative-text"}>
              <span>₹</span>
              {balance}
            </h2>
            <img
              src="/icon/37-arrow-right-1.png"
              alt="arrow"
              className="icon"
            />
          </div>
        </div>
       <div className="graph">
          <div className="toggle-buttons" onClick={handleOnClick}>
            <p
              data-value="DAILY"
              className={active === "DAILY" ? "active" : ""}
            >
              DAILY
            </p>
            <p
              data-value="MONTHLY"
              className={active === "MONTHLY" ? "active" : ""}
              onClick={handleMonthWise}
            >
              MONTHLY
            </p>
            <p
              data-value="YEARLY"
              className={active === "YEARLY" ? "active" : ""}
              onClick={handleMonthWise}
            >
              YEARLY
            </p>
          </div>
          {filteredData.length !== 0 ? (
            <div style={{ width: "100%", height: "161px", marginTop: "10px" }}>
              <ResponsiveContainer>
                <LineChart data={mergeData}>
                  <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#fff" />
                  <YAxis stroke="#fff" domain={[0, "dataMax"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#222",
                      borderRadius: "5px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="green"
                    strokeWidth="3"
                    dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="red"
                    strokeWidth="3"
                    dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="transactions-container">
        
            <div className="headings-container">
              <h2 className="item-heading">Transactions</h2>
              
              <div>
              <span style={{paddingRight:"10px",color:"white",fontWeight:'500'}}>Filter By Date</span>
              <DateRangePicker
                value={value}
                onChange={onChange}
                className="DATE-PICKER"
                 format="yyyy-MM-dd"
                 
              />
              </div>
            </div>
          

          {active === "DAILY" ? (
            filteredData.length === 0 ? (
              <p style={{ fontSize: "26px", color: "white" }}>no data found</p>
            ) : (
              filteredData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "90%",
                  }}
                >
                  <div className="transaction-container-items">
                    <span style={{ fontSize: "20px" }}>{item.transaction}</span>
                    <span
                      className={item.type === "income" ? "income" : "expense"}
                    >
                      ₹{item.amount}
                    </span>
                  </div>

                  <MdDeleteForever
                    size="50px"
                    color="white"
                    className="icon"
                    onClick={() => handleDelete(index)}
                  />
                </div>
              ))
            )
          ) : active === "MONTHLY" ? (
            Object.entries(monthWise).map(([monthKey, transaction]) => {
              // const total = transaction.reduce((acc,curr)=>acc+Number(curr.amount),0)
              const Month_Income = transaction
                .filter((item) => item.type === "income")
                .reduce((acc, curr) => acc + Number(curr.amount), 0);
              const Month_expense = transaction
                .filter((item) => item.type === "expense")
                .reduce((acc, curr) => acc + Number(curr.amount), 0);
              const total = Month_Income - Month_expense;
              const [year, Month] = monthKey.split("-");
              const MonthLabel = `${month_name[Month]} ${year}`;
              return (
                <div  className="transaction-container-items">
                  <span style={{ fontSize: "20px" }}>{MonthLabel} </span>
                  <span className={total < 0 ? "expense" : "income"}>
                    {total}
                  </span>
                </div>
              );
            })
          ) : (
            Object.entries(yearWise).map(([year, transaction]) => {
              // const total = transaction.reduce((acc,curr)=>acc+Number(curr.amount),0)
              const Year_Income = transaction
                .filter((item) => item.type === "income")
                .reduce((acc, curr) => acc + Number(curr.amount), 0);
              const Year_Expense = transaction
                .filter((item) => item.type === "expense")
                .reduce((acc, curr) => acc + Number(curr.amount), 0);
              const total = Year_Income - Year_Expense;

              return (
                <div className="transaction-container-items">
                  <span style={{ fontSize: "20px" }}>{year} </span>
                  <span className={total < 0 ? "expense" : "income"}>
                    {total}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <footer className="footer">
          <img src="/icon/1-home-2.png" className="footer-icon" />
          <img src="/icon/4-activity.png" className="footer-icon" />
          <img src="/icon/33-wallet.png" className="footer-icon" />
        </footer>
        <button className="footer-button" onClick={() => setFormVisble(true)}>
          +
        </button>
      </div>
    </>
  );
}
export default Home;
