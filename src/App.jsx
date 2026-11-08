
import { useEffect, useMemo, useState } from "react";
import Anomaly from "./Anomaly";
import "./App.css";

const initialTransactions = [
  { id: 1, name: "Food & Dining", amount: 1200, type: "Expense", category: "Food", date: "2026-11-08", note: "Restaurant" },
  { id: 2, name: "Salary", amount: 30000, type: "Income", category: "Salary", date: "2026-11-07", note: "Monthly salary" },
  { id: 3, name: "Shopping", amount: 2500, type: "Expense", category: "Shopping", date: "2026-11-06", note: "Clothes" },
  { id: 4, name: "Transport", amount: 500, type: "Expense", category: "Travel", date: "2026-11-05", note: "Cab" },
];

const initialGoals = [
  { id: 1, name: "Emergency Fund", target: 50000, saved: 15000 },
  { id: 2, name: "New Laptop", target: 70000, saved: 20000 },
];

const initialBills = [
  { id: 1, name: "Internet Bill", amount: 999, dueDate: "2026-11-15", paid: false },
  { id: 2, name: "Electricity Bill", amount: 1200, dueDate: "2026-11-20", paid: false },
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  const [accountOpen, setAccountOpen] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => readStorage("paypilot-dark-mode", false)
  );

  const [transactions, setTransactions] = useState(
    () => readStorage("paypilot-transactions", initialTransactions)
  );
  const [goals, setGoals] = useState(
    () => readStorage("paypilot-goals", initialGoals)
  );
  const [bills, setBills] = useState(
    () => readStorage("paypilot-bills", initialBills)
  );

  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalSaved, setGoalSaved] = useState("");

  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDate, setBillDate] = useState("");

  const [transactionName, setTransactionName] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionType, setTransactionType] = useState("Expense");
  const [transactionCategory, setTransactionCategory] = useState("Food");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [transactionNote, setTransactionNote] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [editingId, setEditingId] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm PayPilot AI. Ask me about your expenses, savings, budget or financial habits."
    }
  ]);

  const menu = [
    "Dashboard",
    "My Wallet",
    "Transactions",
    "Budgets",
    "Savings Goals",
    "Expense Analytics",
    "Bill Reminders",
    "Spending Detector",
    "AI Assistant",
    "Settings"
  ];

  useEffect(() => {
    localStorage.setItem("paypilot-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("paypilot-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("paypilot-bills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem("paypilot-dark-mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const totalIncome = useMemo(
    () => transactions.filter(t => t.type === "Income").reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () => transactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  );

  const balance = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchText.toLowerCase()) ||
      t.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === "All" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  function handleLogout() {
    setLoggedIn(false);
    setAccountOpen(false);
    setActivePage("Dashboard");
    setShowPassword(false);
    setShowProfilePassword(false);
    setPassword("");
  }

  function openAccountSettings() {
    setActivePage("Settings");
    setAccountOpen(false);
  }

  function addOrUpdateTransaction(e) {
    e.preventDefault();
    if (!transactionName.trim() || Number(transactionAmount) <= 0) {
      alert("Enter a transaction name and a valid amount.");
      return;
    }

    const item = {
      id: editingId || Date.now(),
      name: transactionName.trim(),
      amount: Number(transactionAmount),
      type: transactionType,
      category: transactionCategory,
      date: transactionDate,
      note: transactionNote
    };

    if (editingId) {
      setTransactions(old => old.map(t => t.id === editingId ? item : t));
      setEditingId(null);
    } else {
      setTransactions(old => [item, ...old]);
    }

    setTransactionName("");
    setTransactionAmount("");
    setTransactionType("Expense");
    setTransactionCategory("Food");
    setTransactionDate(new Date().toISOString().slice(0, 10));
    setTransactionNote("");
  }

  function editTransaction(t) {
    setEditingId(t.id);
    setTransactionName(t.name);
    setTransactionAmount(String(t.amount));
    setTransactionType(t.type);
    setTransactionCategory(t.category);
    setTransactionDate(t.date);
    setTransactionNote(t.note || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteTransaction(id) {
    if (window.confirm("Delete this transaction?")) {
      setTransactions(old => old.filter(t => t.id !== id));
      if (editingId === id) setEditingId(null);
    }
  }

  function addGoal(e) {
    e.preventDefault();
    if (!goalName.trim() || Number(goalTarget) <= 0 || Number(goalSaved) < 0) {
      alert("Please enter valid goal details.");
      return;
    }
    setGoals(old => [
      ...old,
      {
        id: Date.now(),
        name: goalName.trim(),
        target: Number(goalTarget),
        saved: Number(goalSaved)
      }
    ]);
    setGoalName("");
    setGoalTarget("");
    setGoalSaved("");
  }

  function addMoneyToGoal(id) {
    const value = Number(window.prompt("How much money do you want to add?"));
    if (!value || value <= 0) return;
    setGoals(old => old.map(g =>
      g.id === id ? { ...g, saved: Math.min(g.target, g.saved + value) } : g
    ));
  }

  function deleteGoal(id) {
    setGoals(old => old.filter(g => g.id !== id));
  }

  function addBill(e) {
    e.preventDefault();
    if (!billName.trim() || Number(billAmount) <= 0 || !billDate) {
      alert("Please enter all bill details.");
      return;
    }
    setBills(old => [
      ...old,
      { id: Date.now(), name: billName.trim(), amount: Number(billAmount), dueDate: billDate, paid: false }
    ]);
    setBillName("");
    setBillAmount("");
    setBillDate("");
  }

  function toggleBill(id) {
    setBills(old => old.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
  }

  function deleteBill(id) {
    setBills(old => old.filter(b => b.id !== id));
  }

  function getAIResponse(question) {
    const q = question.toLowerCase();

    if (q.includes("balance") || q.includes("money")) {
      return `Your calculated balance from the transactions recorded here is ₹${balance.toLocaleString("en-IN")}. Income: ₹${totalIncome.toLocaleString("en-IN")}; expenses: ₹${totalExpenses.toLocaleString("en-IN")}.`;
    }
    if (q.includes("expense") || q.includes("spend")) {
      const categoryTotals = {};
      transactions.filter(t => t.type === "Expense").forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });
      const biggest = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      return biggest
        ? `Your recorded expenses total ₹${totalExpenses.toLocaleString("en-IN")}. Your highest spending category is ${biggest[0]} at ₹${biggest[1].toLocaleString("en-IN")}. Review that category to find possible savings.`
        : "You haven't recorded any expenses yet. Add transactions to get spending insights.";
    }
    if (q.includes("saving") || q.includes("goal")) {
      const remaining = goals.reduce((sum, g) => sum + Math.max(0, g.target - g.saved), 0);
      return `You have ${goals.length} savings goals. Together, you still need ₹${remaining.toLocaleString("en-IN")} to reach their targets. Try adding a small amount regularly.`;
    }
    if (q.includes("bill") || q.includes("reminder")) {
      const pending = bills.filter(b => !b.paid);
      return `You have ${pending.length} unpaid bills totalling ₹${pending.reduce((s, b) => s + b.amount, 0).toLocaleString("en-IN")}. Check the Bill Reminders page for their due dates.`;
    }
    if (q.includes("budget")) {
      return "Use the Budgets page to compare your spending with your monthly limits. Record transactions regularly for more useful tracking.";
    }
    if (q.includes("tip") || q.includes("advice") || q.includes("help")) {
      return "A useful habit is to record expenses daily, review your largest spending category weekly, set a realistic savings target and pay bills before their due dates.";
    }
    return "I can help you understand your recorded balance, expenses, savings goals, budgets and unpaid bills. Try asking: 'How much did I spend?' or 'How much do I need to save?'";
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatMessages(old => [
      ...old,
      { role: "user", text: question },
      { role: "assistant", text: getAIResponse(question) }
    ]);
    setChatInput("");
  }

  function showPage() {
    switch (activePage) {
      case "Dashboard":
        return (
          <>
            <h1>Welcome to PayPilot AI 👋</h1>
            <p>Your intelligent personal finance assistant.</p>
            <div className="cards">
              <div className="card">
                <h3>Total Balance</h3>
                <h2>₹{balance.toLocaleString("en-IN")}</h2>
                <p>Based on recorded transactions</p>
              </div>
              <div className="card">
                <h3>Total Income</h3>
                <h2>₹{totalIncome.toLocaleString("en-IN")}</h2>
                <p>Recorded income</p>
              </div>
              <div className="card">
                <h3>Total Expenses</h3>
                <h2>₹{totalExpenses.toLocaleString("en-IN")}</h2>
                <p>Recorded expenses</p>
              </div>
            </div>
            <div className="card">
              <h2>Recent Transactions</h2>
              {transactions.slice(0, 5).map(t => (
                <p className="list-row" key={t.id}>
                  {t.name} ({t.category})
                  <strong className={t.type === "Income" ? "income-text" : "expense-text"}>
                    {t.type === "Income" ? "+" : "-"} ₹{t.amount.toLocaleString("en-IN")}
                  </strong>
                </p>
              ))}
            </div>
          </>
        );

      case "My Wallet":
        return (
          <div className="card">
            <h1>My Wallet 💳</h1>
            <h3>Calculated Available Balance</h3>
            <h2>₹{balance.toLocaleString("en-IN")}</h2>
            <p>Income minus expenses recorded in PayPilot AI.</p>
          </div>
        );

      case "Transactions":
        return (
          <>
            <div className="card">
              <h1>Advanced Transaction Management 📋</h1>
              <p>Add, edit, search, filter and delete your transactions.</p>
              <form className="feature-form" onSubmit={addOrUpdateTransaction}>
                <label>Transaction name</label>
                <input value={transactionName} onChange={e => setTransactionName(e.target.value)} placeholder="Example: Grocery shopping" required />
                <label>Amount (₹)</label>
                <input type="number" min="1" value={transactionAmount} onChange={e => setTransactionAmount(e.target.value)} placeholder="Enter amount" required />
                <label>Type</label>
                <select value={transactionType} onChange={e => setTransactionType(e.target.value)}>
                  <option>Expense</option><option>Income</option>
                </select>
                <label>Category</label>
                <select value={transactionCategory} onChange={e => setTransactionCategory(e.target.value)}>
                  <option>Food</option><option>Shopping</option><option>Travel</option><option>Salary</option><option>Bills</option><option>Health</option><option>Education</option><option>Other</option>
                </select>
                <label>Date</label>
                <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} required />
                <label>Note</label>
                <input value={transactionNote} onChange={e => setTransactionNote(e.target.value)} placeholder="Optional note" />
                <button type="submit">{editingId ? "Update Transaction" : "Add Transaction"}</button>
                {editingId && <button type="button" className="secondary-button" onClick={() => { setEditingId(null); setTransactionName(""); setTransactionAmount(""); setTransactionNote(""); }}>Cancel Edit</button>}
              </form>
            </div>
            <div className="card">
              <h2>Transaction History</h2>
              <div className="filter-row">
                <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search name or category" />
                <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option>All</option><option>Income</option><option>Expense</option>
                </select>
              </div>
              {filteredTransactions.map(t => (
                <div className="transaction-item" key={t.id}>
                  <div>
                    <strong>{t.name}</strong>
                    <p>{t.category} • {t.date} • {t.note}</p>
                    <strong className={t.type === "Income" ? "income-text" : "expense-text"}>
                      {t.type === "Income" ? "+" : "-"} ₹{t.amount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="action-buttons">
                    <button type="button" onClick={() => editTransaction(t)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => deleteTransaction(t.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && <p>No matching transactions found.</p>}
            </div>
          </>
        );

      case "Budgets":
        return (
          <div className="card">
            <h1>Monthly Budgets 🎯</h1>
            <p>Sample budget limits. Adjust these to match your real monthly plan.</p>
            {[
              ["Food & Dining", 4000, 6000],
              ["Shopping", 2500, 5000],
              ["Travel", 1500, 4000]
            ].map(([name, spent, limit]) => (
              <div key={name} className="budget-item">
                <h3>{name}</h3>
                <p>₹{spent.toLocaleString("en-IN")} / ₹{limit.toLocaleString("en-IN")}</p>
                <progress value={spent} max={limit} />
              </div>
            ))}
          </div>
        );

      case "Savings Goals":
        return (
          <>
            <div className="card">
              <h1>Savings Goals 🎯</h1>
              <p>Create savings targets and track your progress.</p>
              <form className="feature-form" onSubmit={addGoal}>
                <label>Goal name</label>
                <input value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Example: Buy a laptop" required />
                <label>Target amount (₹)</label>
                <input type="number" min="1" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} required />
                <label>Already saved (₹)</label>
                <input type="number" min="0" value={goalSaved} onChange={e => setGoalSaved(e.target.value)} placeholder="0" required />
                <button type="submit">Create Savings Goal</button>
              </form>
            </div>
            <div className="card">
              <h2>Your Goals</h2>
              {goals.map(g => {
                const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
                return (
                  <div className="goal-item" key={g.id}>
                    <h3>{g.name}</h3>
                    <p>Saved ₹{g.saved.toLocaleString("en-IN")} of ₹{g.target.toLocaleString("en-IN")} ({percent}%)</p>
                    <progress value={g.saved} max={g.target} />
                    <div className="action-buttons">
                      <button type="button" onClick={() => addMoneyToGoal(g.id)}>＋ Add Savings</button>
                      <button type="button" className="danger-button" onClick={() => deleteGoal(g.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
              {goals.length === 0 && <p>No savings goals yet. Create your first goal above.</p>}
            </div>
          </>
        );

      case "Expense Analytics": {
        const expenses = transactions.filter(t => t.type === "Expense");
        const categoryTotals = {};
        expenses.forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        });
        const categoryList = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
        const maxCategory = Math.max(1, ...categoryList.map(x => x[1]));
        return (
          <div className="card">
            <h1>Expense Analytics 📊</h1>
            <p>Insights based on the transactions you have recorded.</p>
            <div className="cards">
              <div className="card"><h3>Total Expenses</h3><h2>₹{totalExpenses.toLocaleString("en-IN")}</h2></div>
              <div className="card"><h3>Total Income</h3><h2>₹{totalIncome.toLocaleString("en-IN")}</h2></div>
              <div className="card"><h3>Transactions</h3><h2>{transactions.length}</h2></div>
            </div>
            <h2>Spending by Category</h2>
            {categoryList.length === 0 && <p>Add expense transactions to see analytics.</p>}
            {categoryList.map(([category, amount]) => (
              <div className="analytics-item" key={category}>
                <div className="list-row"><strong>{category}</strong><strong>₹{amount.toLocaleString("en-IN")}</strong></div>
                <div className="analytics-track">
                  <div className="analytics-fill" style={{ width: `${(amount / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
            <p><strong>Tip:</strong> Review your highest spending category and consider setting a budget for it.</p>
          </div>
        );
      }

      case "Bill Reminders":
        return (
          <>
            <div className="card">
              <h1>Smart Bill Reminders 🔔</h1>
              <p>Record bills and track their due dates and payment status.</p>
              <form className="feature-form" onSubmit={addBill}>
                <label>Bill name</label>
                <input value={billName} onChange={e => setBillName(e.target.value)} placeholder="Example: Mobile recharge" required />
                <label>Bill amount (₹)</label>
                <input type="number" min="1" value={billAmount} onChange={e => setBillAmount(e.target.value)} required />
                <label>Due date</label>
                <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} required />
                <button type="submit">Add Bill Reminder</button>
              </form>
            </div>
            <div className="card">
              <h2>Your Bills</h2>
              {bills.map(b => {
                const days = Math.ceil((new Date(`${b.dueDate}T00:00:00`) - new Date(new Date().toDateString())) / 86400000);
                return (
                  <div className="transaction-item" key={b.id}>
                    <div>
                      <strong>{b.name}</strong>
                      <p>₹{b.amount.toLocaleString("en-IN")} • Due: {b.dueDate}</p>
                      <span className={b.paid ? "income-text" : "expense-text"}>
                        {b.paid ? "Paid" : days < 0 ? `Overdue by ${Math.abs(days)} day(s)` : days === 0 ? "Due today" : `Due in ${days} day(s)`}
                      </span>
                    </div>
                    <div className="action-buttons">
                      <button type="button" onClick={() => toggleBill(b.id)}>{b.paid ? "Mark Unpaid" : "Mark Paid"}</button>
                      <button type="button" className="danger-button" onClick={() => deleteBill(b.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
              {bills.length === 0 && <p>No bills added yet.</p>}
              <p className="small-note">Reminder: These are in-app reminders. They do not send phone notifications or automatically pay bills.</p>
            </div>
          </>
        );

      case "Spending Detector":
        return <Anomaly />;

      case "AI Assistant":
        return (
          <div className="card">
            <h1>PayPilot AI Assistant 🤖</h1>
            <p>Ask questions about your recorded financial information.</p>
            <div className="chat-box">
              {chatMessages.map((m, i) => (
                <div key={i} className={`chat-message ${m.role}`}>
                  <strong>{m.role === "assistant" ? "PayPilot AI" : "You"}</strong>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={sendMessage}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about expenses, balance, savings or bills..." />
              <button type="submit">Send</button>
            </form>
            <p className="small-note">This version uses local rule-based responses, not a connected AI service. It does not provide professional financial advice.</p>
          </div>
        );

      case "Settings":
        return (
          <div className="card">
            <h1>Settings ⚙️</h1>
            <h3>Account Information</h3>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Application:</strong> PayPilot AI</p>
            <div className="theme-setting">
              <div>
                <strong>Dark Mode</strong>
                <p>Change the appearance of your dashboard.</p>
              </div>
              <button type="button" onClick={() => setDarkMode(v => !v)}>
                {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </button>
            </div>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        );

      default:
        return <h1>Welcome to PayPilot AI</h1>;
    }
  }

  if (!loggedIn) {
    return (
      <div className={`login-page ${darkMode ? "dark-theme" : ""}`}>
        <div className="login-card">
          <div className="login-logo">💙</div>
          <h1>PayPilot AI</h1>
          <p className="login-subtitle">Your intelligent personal finance assistant</p>
          <h2>Welcome Back!</h2>
          <p className="login-description">Login to manage your finances smarter.</p>
          <form onSubmit={e => { e.preventDefault(); setLoggedIn(true); setActivePage("Dashboard"); }}>
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Password</label>
            <div className="password-box">
              <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
            <button className="login-button" type="submit">Login →</button>
          </form>
          <p className="login-footer">Secure your money. Simplify your life.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-layout ${darkMode ? "dark-theme" : ""}`}>
      <aside className="sidebar">
        <h2>💙 PayPilot AI</h2>
        <nav>
          {menu.map(item => (
            <button
              key={item}
              className={activePage === item ? "active-menu" : ""}
              onClick={() => { setActivePage(item); setAccountOpen(false); }}
            >
              {item === "Spending Detector" ? "🛡️ " : ""}
              {item === "Savings Goals" ? "🎯 " : ""}
              {item === "Expense Analytics" ? "📊 " : ""}
              {item === "Bill Reminders" ? "🔔 " : ""}
              {item}
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <span>{activePage}</span>
          <button type="button" className="my-account-button" onClick={() => setAccountOpen(!accountOpen)}>
            👤 My Account <span>{accountOpen ? "▲" : "▼"}</span>
          </button>

          {accountOpen && (
            <div className="account-dropdown">
              <div className="profile-header">
                <div className="profile-avatar">👤</div>
                <div><h3>My Profile</h3><p>PayPilot AI Account</p></div>
              </div>
              <hr />
              <div className="profile-details">
                <label>Email Address</label>
                <div className="profile-info"><span>📧</span><span className="profile-value">{email}</span></div>
                <label>Password</label>
                <div className="profile-info">
                  <span>🔒</span>
                  <span className="profile-value">{showProfilePassword ? password : "•".repeat(password.length)}</span>
                  <button type="button" className="password-toggle" onClick={() => setShowProfilePassword(!showProfilePassword)}>{showProfilePassword ? "Hide" : "Show"}</button>
                </div>
              </div>
              <hr />
              <button type="button" className="account-settings-button" onClick={openAccountSettings}>⚙️ Account Settings</button>
              <button type="button" className="account-logout-button" onClick={handleLogout}>↪ Logout</button>
            </div>
          )}
        </div>
        {showPage()}
      </main>
    </div>
  );
}

export default App;
