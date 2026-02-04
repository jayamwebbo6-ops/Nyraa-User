// src/components/InvoiceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import { DownloadPDFButton, BackButton } from "../../components/ui/Myaccountbuttons/MyAccountButtons";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrder } from "../../store/orderSlice";

const InvoiceDetail = () => {
  const { currentOrder: order, loading, error } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOrder(invoiceId));
  }, [invoiceId, dispatch]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add logo (you can replace with your actual logo base64 or URL)
    // doc.addImage('logo-base64-string', 'PNG', 15, 15, 40, 15);
    
    // Header
    doc.setFillColor(3, 169, 244);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 105, 20, { align: "center" });
    
    // Company info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Your Company Name", 15, 40);
    doc.text("123 Business St, Chennai, TN 600001", 15, 47);
    doc.text("GSTIN: 33ABCDE1234F1Z5 | contact@yourcompany.com", 15, 54);
    
    // Invoice details
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.rect(140, 35, 70, 25, 'FD');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice #", 145, 43);
    doc.text(order?.id || '', 145, 50, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(order?.orderDate).toLocaleDateString()}`, 145, 57);
    
    // Billing address
    doc.text("Bill To:", 15, 75);
    doc.setFontSize(9);
    doc.text(`${order?.shippingAddress.name}`, 15, 82);
    doc.text(`${order?.shippingAddress.street}`, 15, 87);
    doc.text(`${order?.shippingAddress.city}, ${order?.shippingAddress.state} ${order?.shippingAddress.zip}`, 15, 92);
    doc.text(`${order?.shippingAddress.country} | ${order?.shippingAddress.phone}`, 15, 97);
    
    // Items table header
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(15, 105, 195, 105); // Top line
    doc.line(15, 105, 15, 280);  // Left line
    doc.line(195, 105, 195, 280); // Right line
    
    // Headers
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Item", 20, 112);
    doc.text("Qty", 120, 112, { align: "center" });
    doc.text("Rate", 140, 112, { align: "center" });
    doc.text("Total", 170, 112, { align: "center" });
    
    doc.line(15, 115, 195, 115); // Header separator
    
    // Items
    let y = 122;
    doc.setFont("helvetica", "normal");
    order?.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      doc.setFontSize(9);
      doc.text(item.name.substring(0, 35), 20, y); // Truncate long names
      doc.text(item.quantity.toString(), 120, y, { align: "center" });
      doc.text(`₹${item.price.toFixed(2)}`, 140, y, { align: "center" });
      doc.text(`₹${itemTotal.toFixed(2)}`, 170, y, { align: "center" });
      y += 8;
    });
    
    // Final lines
    doc.line(15, y, 195, y);
    
    // Summary
    y += 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", 120, y, { align: "right" });
    doc.text(`₹${order?.subtotal}`, 175, y, { align: "right" });
    y += 7;
    doc.text("Shipping:", 120, y, { align: "right" });
    doc.text(`₹${order?.shipping}`, 175, y, { align: "right" });
    y += 7;
    doc.text("Tax:", 120, y, { align: "right" });
    doc.text(`₹${order?.tax}`, 175, y, { align: "right" });
    if (order?.discount > 0) {
      y += 7;
      doc.text("Discount:", 120, y, { align: "right" });
      doc.text(`-₹${order.discount}`, 175, y, { align: "right" });
      y += 7;
    }
    
    // Total
    doc.setFillColor(3, 169, 244);
    doc.rect(120, y + 2, 75, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 125, y + 8, { align: "right" });
    doc.text(`₹${order?.total}`, 190, y + 8, { align: "right" });
    
    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 105, 270, { align: "center" });
    doc.text("For customer support, contact us at support@yourcompany.com", 105, 276, { align: "center" });
    
    doc.save(`invoice_${order?.id}.pdf`);
  };

  if (!order) {
    return <div className="loading">Loading invoice...</div>;
  }

  return (
    <div className="amazon-invoice-container">
      {/* Header with Logo */}
      <div className="invoice-header">
        <div className="logo-section">
          <div className="logo-placeholder">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#FF9900"/>
              <path d="M12 20L20 14L28 20L20 26Z" fill="white"/>
              <circle cx="20" cy="20" r="6" fill="#FF9900"/>
            </svg>
          </div>
          <div className="company-info">
            <h1 className="company-name">Your Company</h1>
            <p>123 Business St, Chennai, TN 600001</p>
            <p>GSTIN: 33ABCDE1234F1Z5 | contact@yourcompany.com</p>
          </div>
        </div>
        <div className="invoice-meta">
          <div className="invoice-number">
            <span className="label">Invoice #</span>
            <span className="value">#{order.id}</span>
          </div>
          <div className="order-date">
            <span className="label">Order Date</span>
            <span className="value">{new Date(order.orderDate).toLocaleDateString()}</span>
          </div>
          <div className="status-badge status-{order.status.toLowerCase()}">
            {order.status}
          </div>
        </div>
      </div>

      <div className="invoice-body">
        {/* Billing Address */}
        <div className="address-section">
          <h3>Bill To</h3>
          <div className="address">
            <div className="name">{order.shippingAddress.name}</div>
            <div>{order.shippingAddress.street}</div>
            <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
            <div>{order.shippingAddress.country}</div>
            <div className="phone">Phone: {order.shippingAddress.phone}</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-section">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="qty">Qty</th>
                <th className="rate">Rate</th>
                <th className="total">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="item-name">{item.name}</td>
                  <td className="qty">{item.quantity}</td>
                  <td className="rate">₹{item.price.toFixed(2)}</td>
                  <td className="total">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="summary-section">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>₹{order.shipping}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>₹{order.tax}</span>
          </div>
          {order.discount > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="total-row">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="invoice-actions">
        <DownloadPDFButton onClick={downloadPDF}>Download PDF</DownloadPDFButton>
        <BackButton onClick={() => navigate("/account/orders")}>Back to Orders</BackButton>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <style jsx>{`
        .amazon-invoice-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
          background: #fafafa;
          min-height: 100vh;
        }

        .invoice-header {
          background: white;
          border-radius: 12px 12px 0 0;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
        }

        .logo-section {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .logo-placeholder {
          background: linear-gradient(135deg, #FF9900, #FF8C00);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .company-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111;
          margin: 0 0 0.25rem 0;
        }

        .company-name + p {
          margin: 0 0 0.125rem 0;
          color: #555;
          font-size: 0.9rem;
        }

        .invoice-meta {
          text-align: right;
        }

        .invoice-number .label,
        .order-date .label {
          display: block;
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        .invoice-number .value,
        .order-date .value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #111;
          line-height: 1.2;
        }

        .status-badge {
          display: inline-block;
          background: #232f3e;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .invoice-body {
          background: white;
          border-radius: 0 0 12px 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .address-section {
          margin-bottom: 2rem;
        }

        .address-section h3 {
          color: #111;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .address .name {
          font-weight: 600;
          color: #111;
          margin-bottom: 0.25rem;
        }

        .address div {
          color: #555;
          font-size: 0.95rem;
          margin-bottom: 0.125rem;
        }

        .phone {
          font-weight: 500;
          color: #e47911 !important;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }

        .items-table th {
          text-align: left;
          padding: 1rem 0.75rem 0.75rem 0;
          font-weight: 600;
          color: #111;
          font-size: 0.9rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .items-table th.qty,
        .items-table th.rate,
        .items-table th.total {
          text-align: right;
          min-width: 80px;
        }

        .items-table td {
          padding: 1rem 0.75rem 0.75rem 0;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
        }

        .item-name {
          font-weight: 500;
          color: #111;
          max-width: 400px;
        }

        .items-table td.qty,
        .items-table td.rate,
        .items-table td.total {
          text-align: right;
          font-family: 'SF Mono', Monaco, monospace;
          font-weight: 600;
          color: #111;
        }

        .summary-section {
          max-width: 400px;
          margin-left: auto;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 1rem;
        }

        .summary-row.discount span:first-child {
          color: #e47911;
        }

        .total-row {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #232f3e;
          font-size: 1.3rem;
          font-weight: 700;
          color: #111;
        }

        .invoice-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          margin-top: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
          .invoice-header {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1.5rem;
          }
          
          .invoice-meta {
            align-self: stretch;
            text-align: left;
          }
          
          .items-table {
            font-size: 0.9rem;
          }
          
          .items-table th,
          .items-table td {
            padding: 0.75rem 0.5rem 0.5rem 0;
          }
          
          .invoice-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .amazon-invoice-container {
            padding: 1rem 0.5rem;
          }
          
          .items-table th:nth-child(3),
          .items-table td:nth-child(3),
          .items-table th:nth-child(4),
          .items-table td:nth-child(4) {
            display: none;
          }
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 50vh;
          font-size: 1.2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default InvoiceDetail;
