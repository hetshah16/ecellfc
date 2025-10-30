"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import SellerNavbar from "@/app/components/SellerNavbar";

export default function Logs() {
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const r = await axios.get("/api/seller/me");
        const sellerRes = await axios.post("/api/seller/info", {
          stall_id: r.data.user.seller_id,
        });
        setSeller(sellerRes.data);
      } catch (err) {
        console.error("Failed to fetch seller:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Session expired or invalid. Please log in again.");
          router.push("/seller/login");
        } else {
          setError("Failed to load seller info");
        }
      }
    };
    fetchSeller();
  }, []);

  useEffect(() => {
    if (!seller?.stall_id) return;
    const fetchTransactions = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.post("/api/seller/logs", {
          stall_id: seller.stall_id,
        });
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [seller]);

  return (
    <div>
      <SellerNavbar />

      <div style={{ padding: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>
          Transaction Logs
        </h1>

        {loading ? (
          <p>Loading transactions...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Sender ID</th>
                  <th style={thStyle}>Sender Name</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.transaction_id} style={trStyle}>
                    <td style={tdStyle}>{tx.sender_id}</td>
                    <td style={tdStyle}>{tx.sender_name}</td>
                    <td style={tdStyle}>₹{tx.amount}</td>
                    <td style={tdStyle}>
                      {new Date(tx.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline styles for table
const thStyle = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "2px solid #ddd",
  background: "#f9f9f9",
};

const tdStyle = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};

const trStyle = {
  background: "#fff",
};
