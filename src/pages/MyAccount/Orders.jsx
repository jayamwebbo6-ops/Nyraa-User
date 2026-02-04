import jsPDF from "jspdf";
const nyraa = "/nyraa.png";


import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { normalizeImagePath } from "../../utils/imageUtils"
import { useSelector, useDispatch } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ConfirmationModal from "../../components/ui/Myaccountconformodel/ConfirmationModal"
import {
  ViewOrderButton,
  CancelOrderButton,
  InvoiceButton,
   TrackOrderButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"
import { fetchUserOrders, clearError } from "../../store/orderSlice"
import ImageViewer from "react-simple-image-viewer"
import {
  DownloadPDFButton,
  BackButton,
  ReturnOrderButton,
} from "../../components/ui/Myaccountbuttons/MyAccountButtons"

const Orders = () => {

const formatAddress = (address = {}) => ({
  name: address.name || address.fullName || "Customer",
  street:
    address.street ||
    address.address ||
    address.addressLine1 ||
    "",
  city: address.city || "",
  state: address.state || "",
  zip:
    address.zip ||
    address.pincode ||
    address.postalCode ||
    "",
  country: address.country || "",
  phone:
    address.phone ||
    address.mobile ||
    ""
});


const formatVariant = (variant) => ({
  color: variant?.color,
  size: variant?.size,
  carat: variant?.carat
});
  const STATUS_LABELS = {
  pending: "Pending",
  processing: "Confirmed", // show “Confirmed” to user
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  return_requested: "Return Requested",
};

  const downloadPDF = (order) => {
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
    `NYRAA JEWELS\nNo 12, Anna Nagar West\nChennai, Tamil Nadu - 600040\nIndia\nPhone: +91 9876543210\nEmail: support@nyraa.com`,
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
  doc.text("INVOICE TO:", invoiceX, invoiceToY, { align: "right" });

  const customerLines = [
  `Name: ${addressObj.name}`,
  `Phone: ${addressObj.phone}`,
  `Email: ${order.user?.email || "-"}`,
  `Address:`,
  addressObj.street,
  `${addressObj.city}, ${addressObj.state}`,
  `${addressObj.zip}, ${addressObj.country}`
].filter(Boolean);

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
};


  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { orders, loading, error, pagination } = useSelector((state) => state.orders)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    itemToDelete: null,
    actionType: "cancel",
    title: "Confirm Order Cancellation",
  })
  const [currentImage, setCurrentImage] = useState(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    dispatch(fetchUserOrders({ page: currentPage, limit: 10, status: statusFilter }))
  }, [dispatch, currentPage, statusFilter])

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
      })
      dispatch(clearError())
    }
  }, [error, dispatch])

  const openImageViewer = (imageUrl) => {
    setCurrentImage(imageUrl)
    setIsViewerOpen(true)
  }
  const getStatusColor = (status) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "delivered":
      return "bg-success text-white";
    case "cancelled":
    case "refunded":
      return "bg-danger text-white";
    case "shipped":
      return "bg-info text-white";
    case "processing": // backend status
    case "confirmed": // user sees as confirmed
      return "bg-warning text-dark";
    case "pending":
      return "bg-secondary text-white";
    default:
      return "bg-secondary text-white";
  }
};


  const closeImageViewer = () => {
    setCurrentImage(null)
    setIsViewerOpen(false)
  }

  const isCancelEligible = (order) => {
    return [ "processing"].includes(order.status.toLowerCase())
  }

  const handleCancelPrompt = (orderId) => {
    setModalConfig({
      itemToDelete: orderId,
      actionType: "cancel",
      title: "Confirm Order Cancellation",
    })
    setShowConfirmModal(true)
  }

  const handleConfirmAction = async () => {

    
    if (modalConfig.actionType === "cancel" && modalConfig.itemToDelete) {
      try {
        // Call API to cancel order
      const response = await fetch(
  `http://localhost:5000/api/orders/${modalConfig.itemToDelete}/cancel`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);



        if (response.ok) {
          toast.success("Order cancelled successfully!", {
            position: "top-right",
            autoClose: 3000,
          })
          // Refresh orders
          dispatch(fetchUserOrders({ page: currentPage, limit: 10, status: statusFilter }))
        } else {
          const data = await response.json()
          toast.error(data.message || "Failed to cancel order", {
            position: "top-right",
            autoClose: 5000,
          })
        }
      } catch (error) {
        toast.error("Failed to cancel order. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        })
      }
    }
    setShowConfirmModal(false)
  }

  const handleCancelAction = () => {
    setShowConfirmModal(false)
  }
  const handleInvoiceDownload = async (orderId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch order");
    }

    downloadPDF(data.order || data);
  } catch (err) {
    toast.error("Unable to generate invoice");
  }
};


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

const getStatusBadgeClass = (status) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "delivered":
      return "bg-success text-white";
    case "cancelled":
    case "refunded":
      return "bg-danger text-white";
    case "shipped":
      return "bg-info text-white";
    case "processing": // backend status
      return "bg-warning text-dark"; // yellow for “Confirmed”
    case "pending":
      return "bg-secondary text-white";
    default:
      return "bg-secondary text-white";
  }
};
  if (loading && orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0 fw-bold">Your Orders</h2>
        <div className="d-flex gap-2 flex-wrap">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
          
            <option value="processing">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-4 my-3 bg-light rounded-4 shadow-sm">
          <h5>No orders found</h5>
          <p className="text-muted">
            {statusFilter ? `No ${statusFilter} orders found.` : "Start shopping to place your first order."}
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3">
            {orders.map((order) => (
              <div key={order.id} className="col-12">
                <div className="card border-0 shadow-lg rounded-4">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <div>
                        <h5 className="card-title mb-0 fw-semibold">Order #{order.orderNumber}</h5>
                        <p className="text-muted small mb-0">
                          Placed on {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
    <span
  className={`status-badge ${order.status.toLowerCase()}`}
>
  {STATUS_LABELS[order.status] || order.status}
</span>

<style jsx>{`
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 500;
    border-radius: 9999px; /* pill shape */
    text-align: center;
    min-width: 60px;
  }

  /* Status-specific colors */
  .pending {
    background-color: #e0e0e0;
    color: #555;
  }
  .processing {
    background-color: #fff4e5;
    color: #f0ad4e; /* orange/yellow */
  }
  .shipped {
    background-color: #d0f0ff;
    color: #00bfff; /* cyan/blue */
  }
  .delivered {
    background-color: #d4edda;
    color: #28a745; /* green */
  }
  .cancelled,
  .refunded {
    background-color: #f8d7da;
    color: #dc3545; /* red */
  }
  .return_requested {
    background-color: #f3e8ff;
    color: #9333ea; /* purple */
  }
`}</style>




                      </div>
                    </div>
                    <div className="order-details ps-1 mb-3">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="d-flex mb-2 align-items-center">
                          <img
                            src={normalizeImagePath(item.productImage)}
                            alt={item.productName}
                            className="item-image me-2"
                            onClick={() => openImageViewer(normalizeImagePath(item.productImage))}
                            style={{ cursor: "pointer" }}
                          />
                          <div>
                            <p className="mb-0">
                              {item.productName} (x{item.quantity})
                            </p>
                            <p className="text-muted small mb-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                            {item.variant && (
                              <p className="text-muted small mb-0">
                                {item.variant.color && `Color: ${item.variant.color} `}
                                {item.variant.size && `Size: ${item.variant.size} `}
                                {item.variant.carat && `Carat: ${item.variant.carat}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-muted small mb-0">+{order.items.length - 2} more items</p>
                      )}
                      <p className="fw-semibold mt-2">Total: ₹{Number.parseFloat(order.total).toFixed(2)}</p>
                    </div>
   <div className="d-flex gap-2 flex-wrap">

  {/* ✅ View button ONLY if NOT pending */}
  {order.status.toLowerCase() !== "pending" && (
    <ViewOrderButton
      onClick={() => navigate(`/account/orders/${order.id}`)}
      orderId={order.id}
    />
  )}

  {/* ✅ Invoice only if NOT pending */}
  

  {/* ✅ Show action buttons only if NOT pending */}
{order.status.toLowerCase() !== "pending" && (
  <InvoiceButton onClick={() => handleInvoiceDownload(order.id)} />
)}



  {/* ✅ Cancel only if eligible */}
  {isCancelEligible(order) && (
    <CancelOrderButton
      onClick={() => handleCancelPrompt(order.id)}
      orderId={order.id}
    />
  )}

  {/* ✅ Track only if shipped or delivered */}
  {["shipped", "delivered"].includes(order.status.toLowerCase()) && (
    <TrackOrderButton order={order} />
  )}

</div>


                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <li key={index + 1} className={`page-item ${pagination.page === index + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pagination.page === pagination.totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        actionType={modalConfig.actionType}
        confirmButtonText="Cancel Order"
      />

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
        .orders-container {
          font-family: 'Open Sans', sans-serif;
          padding: 1.5rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
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
        }
        p {
          font-size: 0.9rem;
          color: #333;
        }
        .card {
          border-radius: 10px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
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
          font-size: 0.75rem;
        }
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .form-select-sm {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
        }
        .pagination .page-link {
          color: #c5a47e;
          border-color: #c5a47e;
        }
        .pagination .page-item.active .page-link {
          background-color: #c5a47e;
          border-color: #c5a47e;
        }
        .pagination .page-link:hover {
          color: #b58963;
          border-color: #b58963;
        }
        @media (max-width: 768px) {
          .orders-container {
            padding: 1rem 0.75rem;
          }
          h2 {
            font-size: 1.3rem;
          }
          h5 {
            font-size: 1rem;
          }
          p {
            font-size: 0.85rem;
          }
          .item-image {
            width: 60px;
            height: 60px;
          }
          .badge {
            font-size: 0.7rem;
          }
          .btn {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .orders-container {
            padding: 0.75rem 0.5rem;
          }
          h2 {
            font-size: 1.2rem;
          }
          h5 {
            font-size: 0.95rem;
          }
          p {
            font-size: 0.8rem;
          }
          .item-image {
            width: 50px;
            height: 50px;
          }
          .badge {
            font-size: 0.65rem;
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

export default Orders
