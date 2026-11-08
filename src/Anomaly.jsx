import React, { useMemo, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  Search,
  CheckCircle,
  Eye,
  RefreshCw,
  Wallet,
  Lightbulb,
  ArrowUpRight,
  Lock
} from "lucide-react";

import "./Anomaly.css";

// Sample transaction history
const initialTransactions = [
  { id: 1, name: "Grocery Shopping", category: "Food", amount: 450, date: "2026-11-01" },
  { id: 2, name: "Restaurant", category: "Food", amount: 380, date: "2026-11-02" },
  { id: 3, name: "Lunch", category: "Food", amount: 420, date: "2026-11-03" },
  { id: 4, name: "Luxury Restaurant", category: "Food", amount: 2200, date: "2026-11-04" },
  { id: 5, name: "Bus Ticket", category: "Transport", amount: 150, date: "2026-11-01" },
  { id: 6, name: "Auto Fare", category: "Transport", amount: 180, date: "2026-11-02" },
  { id: 7, name: "Metro Ticket", category: "Transport", amount: 200, date: "2026-11-03" },
  { id: 8, name: "Online Shopping", category: "Shopping", amount: 1200, date: "2026-11-01" },
  { id: 9, name: "Clothing", category: "Shopping", amount: 1500, date: "2026-11-02" },
  { id: 10, name: "Electronics Purchase", category: "Shopping", amount: 7500, date: "2026-11-05" },
  { id: 11, name: "Electricity Bill", category: "Bills", amount: 900, date: "2026-11-03" },
  { id: 12, name: "Mobile Recharge", category: "Bills", amount: 299, date: "2026-11-04" }
];

const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

function getMedian(values) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

// Analyze transactions and calculate risk scores
function detectAnomalies(transactions) {
  return transactions.map((transaction) => {
    const sameCategory = transactions.filter(
      (item) =>
        item.category === transaction.category &&
        item.id !== transaction.id
    );

    const values = sameCategory.map((item) => item.amount);
    const median = getMedian(values);

    const riskScore = median > 0
      ? Math.min(
          100,
          Math.round((transaction.amount / median) * 20)
        )
      : 0;

    const isAnomaly =
      values.length >= 2 &&
      transaction.amount > median * 2.5 &&
      transaction.amount > 1000;

    let riskLevel = "Low";

    if (riskScore >= 70) {
      riskLevel = "High";
    } else if (riskScore >= 35) {
      riskLevel = "Medium";
    }

    return {
      ...transaction,
      average: median,
      riskScore,
      riskLevel,
      isAnomaly
    };
  });
}

function Anomaly() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [reviewed, setReviewed] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    name: "",
    category: "Food",
    amount: "",
    date: "2026-11-08"
  });

  const analyzedTransactions = useMemo(
    () => detectAnomalies(transactions),
    [transactions]
  );

  const anomalies = analyzedTransactions.filter(
    (item) => item.isAnomaly
  );

  const reviewedCount = anomalies.filter(
    (item) => reviewed.includes(item.id)
  ).length;

  const totalExpenses = transactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const unusualAmount = anomalies.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const highestRisk = analyzedTransactions.reduce(
    (highest, item) =>
      Math.max(highest, item.riskScore),
    0
  );

  const highestRiskTransaction = analyzedTransactions.find(
    (item) => item.riskScore === highestRisk
  );

  const filteredTransactions = analyzedTransactions.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Unusual" && item.isAnomaly) ||
      (filter === "Normal" && !item.isAnomaly);

    return matchesSearch && matchesFilter;
  });

  function markReviewed(id) {
    setReviewed((previous) =>
      previous.includes(id)
        ? previous
        : [...previous, id]
    );
  }

  function addTransaction(e) {
    e.preventDefault();

    if (
      !newTransaction.name.trim() ||
      !newTransaction.amount ||
      Number(newTransaction.amount) <= 0
    ) {
      alert("Please enter valid transaction details.");
      return;
    }

    const transaction = {
      ...newTransaction,
      id: Date.now(),
      amount: Number(newTransaction.amount)
    };

    setTransactions((previous) => [
      ...previous,
      transaction
    ]);

    setNewTransaction({
      name: "",
      category: "Food",
      amount: "",
      date: "2026-11-08"
    });

    setShowAddForm(false);
  }

  function resetData() {
    setTransactions(initialTransactions);
    setReviewed([]);
    setSearch("");
    setFilter("All");
    setShowAddForm(false);
  }

  function getRiskClass(level) {
    return level.toLowerCase();
  }

  return (
    <div className="anomaly-page">

      {/* HEADER */}
      <div className="anomaly-header">
        <div>
          <div className="anomaly-heading">
            <ShieldAlert size={30} />
            <h1>Spending Anomaly Detector</h1>
          </div>

          <p>
            Detect unusual spending patterns and protect your finances.
          </p>
        </div>

        <button
          className="anomaly-add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          + Add Transaction
        </button>
      </div>

      {/* ADD TRANSACTION FORM */}
      {showAddForm && (
        <form
          className="anomaly-form"
          onSubmit={addTransaction}
        >
          <h3>Add New Transaction</h3>

          <input
            type="text"
            placeholder="Transaction name"
            value={newTransaction.name}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                name: e.target.value
              })
            }
            required
          />

          <select
            value={newTransaction.category}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                category: e.target.value
              })
            }
          >
            <option>Food</option>
            <option>Shopping</option>
            <option>Transport</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Health</option>
          </select>

          <input
            type="number"
            min="1"
            placeholder="Amount in ₹"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                amount: e.target.value
              })
            }
            required
          />

          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                date: e.target.value
              })
            }
            required
          />

          <button
            type="submit"
            className="anomaly-add-btn"
          >
            Save Transaction
          </button>

          <button
            type="button"
            className="reset-button"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* STATISTICS */}
      <div className="anomaly-stats">

        <div className="anomaly-stat-card">
          <div className="stat-icon purple">
            <Wallet />
          </div>
          <p>Total Expenses</p>
          <h2>{formatCurrency(totalExpenses)}</h2>
          <span>All recorded transactions</span>
        </div>

        <div className="anomaly-stat-card">
          <div className="stat-icon red">
            <AlertTriangle />
          </div>
          <p>Unusual Transactions</p>
          <h2>{anomalies.length}</h2>
          <span>Require your attention</span>
        </div>

        <div className="anomaly-stat-card">
          <div className="stat-icon orange">
            <TrendingUp />
          </div>
          <p>Unusual Spending</p>
          <h2>{formatCurrency(unusualAmount)}</h2>
          <span>Amount in flagged transactions</span>
        </div>

        <div className="anomaly-stat-card">
          <div className="stat-icon green">
            <CheckCircle />
          </div>
          <p>Reviewed Alerts</p>
          <h2>
            {reviewedCount}/{anomalies.length}
          </h2>
          <span>Alerts marked as reviewed</span>
        </div>

      </div>

      {/* FRAUD RISK SCORE OVERVIEW */}
      <div className="fraud-risk-overview">
        <div className="fraud-risk-title">
          <ShieldCheck size={25} />
          <h2>Fraud Risk Score Overview</h2>
        </div>

        <p className="fraud-risk-subtitle">
          Highest transaction risk score
          <strong> {highestRisk}/100</strong>
        </p>

        <div className="risk-progress-track">
          <div
            className={`risk-progress-fill ${highestRisk >= 70 ? "high" : highestRisk >= 35 ? "medium" : "low"}`}
            style={{ width: `${highestRisk}%` }}
          />
        </div>

        <div className="risk-overview-details">
          <span>
            {highestRiskTransaction
              ? highestRiskTransaction.name
              : "No transactions"}
          </span>

          <span className={`risk-badge ${highestRisk >= 70 ? "high" : highestRisk >= 35 ? "medium" : "low"}`}>
            {highestRisk >= 70
              ? "High Risk"
              : highestRisk >= 35
              ? "Medium Risk"
              : "Low Risk"}
          </span>
        </div>

        <p className="risk-note">
          Risk scores are statistical indicators based on category spending patterns.
        </p>
      </div>

      {/* AI INSIGHT */}
      <div className="anomaly-insight">
        <div className="insight-icon">
          <Lightbulb size={25} />
        </div>

        <div>
          <h3>PayPilot AI Financial Insight</h3>

          {anomalies.length > 0 ? (
            <p>
              We identified {anomalies.length} unusual transaction(s).
              Your highest flagged expense is{" "}
              {formatCurrency(
                Math.max(...anomalies.map((item) => item.amount))
              )}.
              Review these transactions to understand your spending.
            </p>
          ) : (
            <p>
              No unusual transactions were detected using the current
              spending rule. Continue monitoring your expenses.
            </p>
          )}
        </div>
      </div>

      {/* UNUSUAL SPENDING ALERTS */}
      <div className="anomaly-section">

        <div className="section-heading">
          <div>
            <h2>
              <AlertTriangle size={21} />
              Unusual Spending Alerts
            </h2>
            <p>
              Transactions that are significantly higher than their category baseline.
            </p>
          </div>
        </div>

        {anomalies.length === 0 ? (
          <div className="anomaly-empty">
            <CheckCircle size={35} />
            <h3>No unusual spending found!</h3>
          </div>
        ) : (
          anomalies.map((item) => (
            <div className="anomaly-alert" key={item.id}>

              <div className="alert-symbol">
                <AlertTriangle />
              </div>

              <div className="alert-details">
                <h3>{item.name}</h3>

                <p>
                  {item.category} • {item.date}
                </p>

                <p className="alert-reason">
                  Amount is higher than 2.5 times the category
                  median of {formatCurrency(item.average)}.
                </p>

                <div className="alert-risk-info">
                  <Lock size={14} />
                  Fraud Risk Score:

                  <span className={`risk-badge ${getRiskClass(item.riskLevel)}`}>
                    {item.riskScore}/100 - {item.riskLevel} Risk
                  </span>
                </div>
              </div>

              <div className="alert-action">
                <h3>{formatCurrency(item.amount)}</h3>

                {reviewed.includes(item.id) ? (
                  <span className="reviewed-label">
                    <CheckCircle size={14} />
                    Reviewed
                  </span>
                ) : (
                  <button onClick={() => markReviewed(item.id)}>
                    Mark Reviewed
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* TRANSACTION ANALYSIS */}
      <div className="anomaly-section">

        <div className="section-heading">
          <div>
            <h2>
              <Activity size={21} />
              Transaction Analysis
            </h2>
            <p>
              Search and review all analyzed transactions and risk scores.
            </p>
          </div>

          <button
            className="reset-button"
            onClick={resetData}
          >
            <RefreshCw size={15} />
            Reset Demo Data
          </button>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="anomaly-controls">

          <div className="anomaly-search">
            <Search size={18} />

            <input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Unusual</option>
            <option>Normal</option>
          </select>

        </div>

        {/* TRANSACTION TABLE */}
        <div className="anomaly-table-wrapper">

          <table className="anomaly-table">

            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Detection</th>
                <th>Fraud Risk Score</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((item) => (
                <tr key={item.id}>

                  <td>{item.name}</td>

                  <td>{item.category}</td>

                  <td>{item.date}</td>

                  <td>{formatCurrency(item.amount)}</td>

                  <td>
                    {item.isAnomaly ? (
                      <span className="status-unusual">
                        Unusual
                      </span>
                    ) : (
                      <span className="status-normal">
                        Normal
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="table-risk-score">
                      <strong>{item.riskScore}/100</strong>
                      <span className={`risk-badge ${getRiskClass(item.riskLevel)}`}>
                        {item.riskLevel}
                      </span>
                    </div>
                  </td>

                  <td>
                    {item.isAnomaly ? (
                      reviewed.includes(item.id) ? (
                        <span className="reviewed-label">
                          <CheckCircle size={14} />
                          Reviewed
                        </span>
                      ) : (
                        <button
                          className="view-alert"
                          onClick={() => markReviewed(item.id)}
                        >
                          <Eye size={15} />
                          Review
                        </button>
                      )
                    ) : (
                      <span className="normal-text">
                        No alert
                      </span>
                    )}
                  </td>

                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-results">
                    No matching transactions found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* RISK SCORE EXPLANATION */}
      <div className="risk-explanation">

        <div className="risk-explanation-heading">
          <ShieldCheck size={22} />
          <h2>Understanding Fraud Risk Scores</h2>
        </div>

        <div className="risk-level-grid">

          <div className="risk-level-card">
            <span className="risk-dot low-dot" />
            <h3>0–34: Low Risk</h3>
            <p>
              Spending is close to the category baseline.
            </p>
          </div>

          <div className="risk-level-card">
            <span className="risk-dot medium-dot" />
            <h3>35–69: Medium Risk</h3>
            <p>
              Spending is higher than the usual category pattern.
            </p>
          </div>

          <div className="risk-level-card">
            <span className="risk-dot high-dot" />
            <h3>70–100: High Risk</h3>
            <p>
              Spending is significantly higher than the baseline.
            </p>
          </div>

        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="anomaly-recommendation">

        <Lightbulb size={23} />

        <div>
          <h3>Smart Financial Recommendations</h3>
          <p>
            Review high-risk transactions, set category-wise spending
            limits, and verify transaction details before taking action.
          </p>
        </div>

        <ArrowUpRight size={22} />

      </div>

      {/* DISCLAIMER */}
      <p className="anomaly-disclaimer">
        Demo mode: Fraud risk scores are statistical indicators calculated
        from sample transaction history. An unusual transaction does not
        necessarily indicate fraud. Always verify transactions before
        taking action.
      </p>

    </div>
  );
}

export default Anomaly;