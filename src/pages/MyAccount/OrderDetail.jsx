"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { normalizeImagePath } from "../../utils/imageUtils"
import { useSelector, useDispatch } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import {
  DownloadPDFButton,
  BackButton,
  TrackOrderButton,
  ReturnOrderButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"
import { fetchOrder, clearError } from "../../store/orderSlice"
import ImageViewer from "react-simple-image-viewer"
const nyraa = "/nyraa.png";

const OrderDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentOrder: order, loading, error } = useSelector((state) => state.orders)
  const [currentImage, setCurrentImage] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrder(orderId))
    }
  }, [dispatch, orderId])

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
      })
      dispatch(clearError())
      // Redirect to orders page if order not found
      if (error.includes("not found")) {
        navigate("/account/orders")
      }
    }
  }, [error, dispatch, navigate])

  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl)
    setIsViewerOpen(true)
  }

  const closeImageViewer = () => {
    setCurrentImage(null)
    setIsViewerOpen(false)
  }

  const isReturnEligible = () => {
    if (!order || order.status.toLowerCase() !== "delivered" || !order.deliveryDate || order.isReturnDenied) {
      return false
    }
    const deliveryDate = new Date(order.deliveryDate)
    const currentDate = new Date()
    if (isNaN(deliveryDate.getTime())) {
      console.warn(`Invalid deliveryDate for order ${order.id}: ${order.deliveryDate}`)
      return false
    }
    const daysSinceDelivery = (currentDate - deliveryDate) / (1000 * 60 * 60 * 24)
    return daysSinceDelivery <= 10
  }

  // Enhanced formatAddress function specifically for your double-encoded JSON issue
  const formatAddress = (address) => {
    console.log('Raw address from order:', address, typeof address); // Debug log

    // Default address object
    const defaultAddress = {
      name: "N/A",
      street: "N/A", 
      city: "N/A",
      state: "N/A",
      zip: "N/A",
      country: "N/A",
      phone: "N/A"
    };

    if (!address) {
      console.warn("No address provided");
      return defaultAddress;
    }

    // If address is already a proper object, use it directly
    if (typeof address === "object" && address !== null && !Array.isArray(address)) {
      console.log('Address is already an object:', address);
      return {
        name: address.name || defaultAddress.name,
        street: address.street || defaultAddress.street,
        city: address.city || defaultAddress.city,
        state: address.state || defaultAddress.state,
        zip: address.zip || defaultAddress.zip,
        country: address.country || defaultAddress.country,
        phone: address.phone || defaultAddress.phone
      };
    }

    // If address is a string, handle double-encoded JSON
    if (typeof address === "string") {
      try {
        console.log('Attempting to parse address string...');
        
        // First parse - this should give us another JSON string
        let firstParse = JSON.parse(address);
        console.log('First parse result:', firstParse, typeof firstParse);
        
        // If first parse gives us a string, parse again (double-encoded case)
        if (typeof firstParse === "string") {
          console.log('Double-encoded JSON detected, parsing again...');
          let secondParse = JSON.parse(firstParse);
          console.log('Second parse result:', secondParse);
          
          return {
            name: secondParse.name || defaultAddress.name,
            street: secondParse.street || defaultAddress.street,
            city: secondParse.city || defaultAddress.city,
            state: secondParse.state || defaultAddress.state,
            zip: secondParse.zip || defaultAddress.zip,
            country: secondParse.country || defaultAddress.country,
            phone: secondParse.phone || defaultAddress.phone
          };
        } 
        // If first parse gives us an object, use it directly
        else if (typeof firstParse === "object" && firstParse !== null) {
          console.log('Single-encoded JSON, using directly');
          return {
            name: firstParse.name || defaultAddress.name,
            street: firstParse.street || defaultAddress.street,
            city: firstParse.city || defaultAddress.city,
            state: firstParse.state || defaultAddress.state,
            zip: firstParse.zip || defaultAddress.zip,
            country: firstParse.country || defaultAddress.country,
            phone: firstParse.phone || defaultAddress.phone
          };
        }
      } catch (error) {
        console.error("Error parsing address string:", error, "Raw address:", address);
        return defaultAddress;
      }
    }

    console.warn("Address is not in expected format:", typeof address, address);
    return defaultAddress;
  };

  // Improved formatVariant function
  const formatVariant = (variant) => {
    const defaultVariant = { color: null, size: null, carat: null };

    if (!variant) {
      return defaultVariant;
    }

    // If variant is already an object, use it directly
    if (typeof variant === "object" && variant !== null) {
      return {
        color: variant.color || null,
        size: variant.size || null,
        carat: variant.carat || variant.type || null
      };
    }

    // If variant is a string, try to parse it
    if (typeof variant === "string") {
      try {
        // Handle double-encoded JSON
        let parsed = variant;
        if (variant.startsWith('"') && variant.endsWith('"')) {
          parsed = JSON.parse(variant);
        }
        parsed = JSON.parse(parsed);
        
        return {
          color: parsed.color || null,
          size: parsed.size || null,
          carat: parsed.carat || parsed.type || null
        };
      } catch (error) {
        console.error("Error parsing variant:", error, "Raw variant:", variant);
        return defaultVariant;
      }
    }

    return defaultVariant;
  };

  const downloadPDF = () => {
  if (!order) return;

  const doc = new jsPDF();
  const addressObj = formatAddress(order.shippingAddress);
  const primaryColor = [212, 122, 157]; // Pink (#D47A9D)
  const darkColor = [26, 26, 46]; // Dark color

  // --- 1. LOGO (TOP LEFT) ---
  const logoX = 20, logoY = 10, logoWidth = 50, logoHeight = 20;
  try {
    doc.addImage(nyraa, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch {
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text("NYRAA", logoX + logoWidth / 2, logoY + 10, { align: "center" });
  }

  // --- 2. COMPANY DETAILS (UNDER LOGO WITH GAP) ---
  const companyLines = doc.splitTextToSize(
    `NYRAA \nNo 12, Anna Nagar West\nChennai, Tamil Nadu - 600040\nIndia\nPhone: +91 9876543210\nEmail: support@nyraa.com`,
    70
  );
  const companyY = logoY + logoHeight + 8; // 8mm gap after logo
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkColor);
  doc.text(companyLines, logoX, companyY);

  // --- 3. INVOICE TITLE (TOP RIGHT) ---
  const invoiceX = 190, invoiceY = 20;
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", invoiceX, invoiceY, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: #${order.orderNumber}`, invoiceX, invoiceY + 8, { align: "right" });
  doc.text(`Invoice Date: ${new Date(order.orderDate).toLocaleDateString()}`, invoiceX, invoiceY + 14, { align: "right" });

  // --- 4. INVOICE TO (UNDER INVOICE) ---
  const invoiceToY = invoiceY + 24;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", invoiceX, invoiceToY, { align: "right" });

  const customerLines = [
    `Name: ${addressObj.name}`,
    `Phone: ${addressObj.phone}`,
    `Email: ${order.user?.email || "-"}`,
    `Address: ${addressObj.street}, ${addressObj.city}, ${addressObj.state}, ${addressObj.zip}, ${addressObj.country}`
  ];
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(customerLines, invoiceX, invoiceToY + 6, { align: "right" });

  // --- 5. CALCULATE TOP CONTENT MAX Y ---
  const companyHeight = companyLines.length * 5;
  const customerHeight = customerLines.length * 5;
  const topContentMaxY = Math.max(companyY + companyHeight, invoiceToY + customerHeight);

  // --- 6. TABLE HEADER ---
  const tableY = topContentMaxY + 5;
  doc.setFillColor(...primaryColor);
  doc.rect(20, tableY, 170, 8, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text("SL", 22, tableY + 5);
  doc.text("ITEM DESCRIPTION", 40, tableY + 5);
  doc.text("UNIT PRICE", 115, tableY + 5);
  doc.text("QTY", 145, tableY + 5);
  doc.text("TOTAL", 170, tableY + 5);

  // --- 7. TABLE BODY ---
  let currentY = tableY + 15;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50);

  order.items.forEach((item, index) => {
    const variant = formatVariant(item.variant);
    const variantText = [
      variant.color && `Color: ${variant.color}`,
      variant.size && `Size: ${variant.size}`,
      variant.carat && `Type: ${variant.carat}`
    ].filter(Boolean).join(", ");

    const description = `${item.productName}${variantText ? '\n' + variantText : ''}`;
    const descLines = doc.splitTextToSize(description, 65);
    const rowHeight = descLines.length * 6;

    doc.text(String(index + 1).padStart(2, "0"), 22, currentY);
    doc.text(descLines, 40, currentY);
    doc.text(`₹ ${Number(item.price).toFixed(2)}`, 115, currentY, { align: "right" });
    doc.text(String(item.quantity), 145, currentY, { align: "center" });
    doc.text(`₹ ${(item.price * item.quantity).toFixed(2)}`, 170, currentY, { align: "right" });

    doc.setDrawColor(230);
    doc.line(20, currentY + rowHeight + 2, 190, currentY + rowHeight + 2);
    currentY += rowHeight + 8;

    if (currentY > 230) {
      doc.addPage();
      currentY = 30;
    }
  });

  // --- 8. TOTALS SECTION ---
  const finalY = currentY + 8;
  const labelX = 140;
  const valueX = 175;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkColor);

  const totals = [
    { label: "Subtotal", value: order.subtotal },
    { label: "Shipping", value: order.shipping },
    { label: "Tax", value: order.tax }
  ];

  totals.forEach((t, i) => {
    doc.text(t.label, labelX, finalY + i * 7);
    doc.text(`₹ ${Number(t.value).toFixed(2)}`, valueX, finalY + i * 7, { align: "right" });
  });

  // --- TOTAL BOX ---
  const totalBoxY = finalY + 18;
  doc.setFillColor(...primaryColor);
  doc.rect(labelX - 5, totalBoxY, 55, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text("TOTAL", labelX, totalBoxY + 7);
  doc.text(`₹ ${Number(order.total).toFixed(2)}`, valueX, totalBoxY + 7, { align: "right" });

  // --- 9. FOOTER ---
  doc.setFillColor(...darkColor);
  doc.ellipse(50, 290, 150, 30, "F");
  doc.ellipse(160, 290, 100, 20, "F");

  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for shopping with NYRAA 💖", 105, 285, { align: "center" });

  // --- 10. SAVE PDF ---
  doc.save(`Invoice_${order.orderNumber}.pdf`);
};;






  const handleTrackOrder = () => {
    if (order.trackingNumber) {
      toast.info(`Tracking Number: ${order.trackingNumber}`, {
        position: "top-right",
        autoClose: 5000,
      })
    } else {
      toast.info("Tracking information not available yet.", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  const handleReturnOrder = () => {
    if (isReturnEligible()) {
      navigate(`/account/orders/${order.id}/return`)
    } else {
      toast.error("This order is not eligible for return.", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }
const STATUS_LABELS = {
  pending: "Pending",
  processing: "Confirmed", // show “Confirmed” to user
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  return_requested: "Return Requested",
};

  const getStatusBadgeClass = (status) => {
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case "delivered":
      return "bg-success text-white"
    case "cancelled":
    case "refunded":
      return "bg-danger text-white"
    case "shipped":
      return "bg-info text-white"
    case "processing": // backend status
      return "bg-warning text-dark" // yellow for "Confirmed"
    case "pending":
      return "bg-secondary text-white"
    case "return_requested":
      return "bg-purple-100 text-purple-700"
    default:
      return "bg-secondary text-white"
  }
}


  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="text-center py-5">
          <h5>Order not found</h5>
          <p className="text-muted">The order you're looking for doesn't exist or you don't have access to it.</p>
          <BackButton onClick={() => navigate("/account/orders")} />
        </div>
      </div>
    )
  }

  const addressObj = formatAddress(order.shippingAddress)
  console.log('Formatted address object:', addressObj); // Debug log

  return (
    <div className="order-detail-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">Order #{order.orderNumber}</h2>
        <span className={`badge ${getStatusBadgeClass(order.status)} rounded-pill px-3 py-2`}>
  {STATUS_LABELS[order.status] || order.status}
</span>

      </div>

      <div className="card p-4 border-0 shadow-lg rounded-4">
        <div className="row">
          <div className="col-md-6 mb-4">
            <h5>Order Details</h5>
            <p>
              <strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod ? order.paymentMethod.replace(/([A-Z])/g, " $1").trim() : "Not specified"}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              {order.paymentStatus
                ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                : "Pending"}
            </p>
            {order.trackingNumber && (
              <p>
                <strong>Tracking Number:</strong> {order.trackingNumber}
              </p>
            )}
               {order.trackingLink && (
              <p>
                <strong>Tracking Link:</strong> {order.trackingLink}
              </p>
            )}
            {order.deliveryDate && (
              <p>
                <strong>Delivered On:</strong> {new Date(order.deliveryDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="col-md-6 mb-4">
            <h5>Shipping Address</h5>
            <div className="address-display">
              <p><strong>Name:</strong> {addressObj.name}</p>
              <p><strong>Address:</strong> {addressObj.street}</p>
              <p>
                <strong>City:</strong> {addressObj.city}, {addressObj.state} {addressObj.zip}
              </p>
              <p><strong>Country:</strong> {addressObj.country}</p>
              <p><strong>Phone:</strong> {addressObj.phone}</p>
            </div>
          </div>
        </div>

        {order.specialInstructions && (
          <div className="mb-4">
            <h5>Special Instructions</h5>
            <p className="text-muted">{order.specialInstructions}</p>
          </div>
        )}

        <div className="mb-4">
          <h5>Items ({order.items.length})</h5>
          {order.items.map((item) => {
            const itemVariant = formatVariant(item.variant)
            return (
              <div key={item.id} className="d-flex mb-3 align-items-start border-bottom pb-3">
                <img
                  src={normalizeImagePath(item.productImage)}
                  alt={item.productName}
                  className="item-image me-3"
                  onClick={() => openImageViewer(normalizeImagePath(item.productImage))}
                  style={{ cursor: "pointer" }}
                />
                <div className="flex-grow-1">
                  <p className="mb-1">
                    <strong>{item.productName}</strong> (x{item.quantity})
                  </p>
                  {(itemVariant.color || itemVariant.size || itemVariant.carat) && (
                    <p className="mb-1 text-muted small">
                      {itemVariant.color && `Color: ${itemVariant.color} `}
                      {itemVariant.size && `Size: ${itemVariant.size} `}
                      {itemVariant.carat && `Type: ${itemVariant.carat}`}
                    </p>
                  )}
                  <p className="mb-0">
                    ₹{Number.parseFloat(item.price).toFixed(2)} each = ₹
                    {(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mb-4">
  <div className="row">
    <div className="col-md-6">
      <h5>Order Summary</h5>
    </div>
    <div className="col-md-6">
      <div className="order-summary-details">
        <div className="d-flex justify-content-between mb-2">
          <p>Subtotal</p>
          <p>₹{Number.parseFloat(order.subtotal).toFixed(2)}</p>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <p>Shipping</p>
          <p>₹{Number.parseFloat(order.shipping).toFixed(2)}</p>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <p>Tax</p>
          <p>₹{Number.parseFloat(order.tax).toFixed(2)}</p>
        </div>
        {Number.parseFloat(order.discount) > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <p>Discount</p>
            <p className="text-success">-₹{Number.parseFloat(order.discount).toFixed(2)}</p>
          </div>
        )}
        <div className="d-flex justify-content-between border-top pt-2">
          <h6 className="mb-0">
            <strong>Total</strong>
          </h6>
          <h6 className="mb-0">
            <strong>₹{Number.parseFloat(order.total).toFixed(2)}</strong>
          </h6>
        </div>
      </div>
    </div>
  </div>
</div>

        {(order.returnReason || order.status === "return_requested") && (
          <div className="mb-4 p-4 border rounded-4 bg-light shadow-sm">
            <h5 className="text-primary mb-3">Return Information</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <p className="mb-1 text-muted small uppercase fw-bold">Return Reason</p>
                <p className="mb-0 text-dark">{order.returnReason || "Not specified"}</p>
              </div>
              <div className="col-md-6 mb-3">
                <p className="mb-1 text-muted small uppercase fw-bold">Additional Comments</p>
                <p className="mb-0 text-dark">{order.returnComments || "No additional comments"}</p>
              </div>
            </div>

            {order.returnPhotos && (
              <div className="mt-3">
                <p className="mb-2 text-muted small uppercase fw-bold">Evidence Photos</p>
                <div className="d-flex gap-2 flex-wrap">
                  {(() => {
                    let photos = [];
                    try {
                      photos = typeof order.returnPhotos === 'string' ? JSON.parse(order.returnPhotos) : order.returnPhotos;
                      if (typeof photos === 'string') photos = JSON.parse(photos); // Handle double encoding
                    } catch (e) {
                      console.error("Error parsing return photos:", e);
                    }
                    return Array.isArray(photos) ? photos.map((photo, idx) => (
                      <img 
                        key={idx} 
                        src={normalizeImagePath(photo)} 
                        alt={`Evidence ${idx + 1}`} 
                        className="rounded border shadow-sm"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => openImageViewer(normalizeImagePath(photo))}
                      />
                    )) : null;
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="d-flex gap-2 flex-wrap">
          <DownloadPDFButton onClick={downloadPDF} />
       <TrackOrderButton
  order={order}          // <-- pass the order object
  onClick={handleTrackOrder}
/>

          {isReturnEligible() && <ReturnOrderButton onClick={handleReturnOrder} />}
          <BackButton onClick={() => navigate("/account/orders")} />
        </div>
      </div>

      {isViewerOpen && (
        <ImageViewer
          src={[currentImage] || "/placeholder.svg"}
          currentIndex={0}
          disableScroll={false}
          closeOnClickOutside={true}
          onClose={closeImageViewer}
          backgroundStyle={{
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 9999,
          }}
        />
      )}

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
        .order-detail-container {
          font-family: 'Open Sans', sans-serif;
          padding: 1.5rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #222;
        }
        h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
          margin-bottom: 1rem;
        }
        h6 {
          font-size: 1rem;
          font-weight: 600;
          color: #222;
        }
        p {
          font-size: 0.9rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .address-display {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        .address-display p {
          margin-bottom: 0.5rem;
        }
        .address-display p:last-child {
          margin-bottom: 0;
        }
        .item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.2s;
        }
        .item-image:hover {
          transform: scale(1.05);
        }
        .text-muted {
          font-size: 0.85rem;
          color: #666;
        }
        .badge {
          font-size: 0.875rem;
          font-weight: 500;
        }
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .border-bottom {
          border-bottom: 1px solid #dee2e6 !important;
        }
        .border-top {
          border-top: 1px solid #dee2e6 !important;
        }
        .bg-purple-100 {
          background-color: #f3e8ff !important;
        }
        .text-purple-700 {
          color: #7e22ce !important;
        }
        @media (max-width: 768px) {
          .order-detail-container {
            padding: 1rem 0.75rem;
          }
          h2 {
            font-size: 1.3rem;
          }
          h5 {
            font-size: 1rem;
          }
          h6 {
            font-size: 0.9rem;
          }
          p {
            font-size: 0.85rem;
          }
          .item-image {
            width: 60px;
            height: 60px;
          }
          .btn {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .order-detail-container {
            padding: 0.75rem 0.5rem;
          }
          h2 {
            font-size: 1.2rem;
          }
          h5 {
            font-size: 0.95rem;
          }
          h6 {
            font-size: 0.85rem;
          }
          p {
            font-size: 0.8rem;
          }
          .item-image {
            width: 50px;
            height: 50px;
          }
          .btn {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
          .d-flex.gap-2 {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default OrderDetail
