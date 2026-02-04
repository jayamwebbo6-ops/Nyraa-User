import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
    SaveIcon,
    CloseIcon,
    Edit2Icon as EditIcon,
    CheckCircleIcon,
    PlusIcon,
    RefreshIcon,
    TrashIcon,
    LogOutIcon,
    ViewIcon,
    InvoiceIcon,
    CancelIcon,
    TrackIcon,
    DownloadIcon,
    ArrowLeftIcon,
    ReturnIcon
} from '../Myaccounticons/MyAccountIcons';

// Track Order Modal Component
const TrackOrderModal = ({ isOpen, onClose, order, onConfirm }) => {
  if (!isOpen) return null;



  return (
    <>
      <style jsx>{`
        .track-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }

        .track-modal-container {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          width: 90vw;
          max-width: 480px;
          max-height: 90vh;
          overflow: hidden;
          animation: modalSlideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .track-modal-header {
         background: linear-gradient(135deg, rgb(190, 105, 146) 0%, rgb(212, 122, 157) 100%);
          color: white !important;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .track-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .track-modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .track-modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .track-modal-body {
          padding: 32px 24px;
        }

        .track-modal-section {
          margin-bottom: 24px;
        }

        .track-modal-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .track-modal-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafbfc;
          color: #1f2937;
        }

        .track-modal-input:focus {
          outline: none;
          border-color: #8B5CF6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          background: white;
        }

        .track-modal-footer {
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .track-modal-buttons {
          display: flex;
          gap: 12px;
          flex-direction: row-reverse;
        }

        @media (max-width: 480px) {
          .track-modal-container {
            width: 95vw;
            margin: 16px;
          }
          
          .track-modal-body {
            padding: 24px 20px;
          }
          
          .track-modal-footer {
            padding: 20px;
            flex-direction: column-reverse;
          }
          
          .track-modal-buttons {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>
      
     <div className="track-modal-overlay" onClick={onClose}>
  <div
    className="track-modal-container"
    onClick={(e) => e.stopPropagation()}
  >
    {/* HEADER */}
    <div className="track-modal-header">
      <h2 className="track-modal-title">
        <TrackIcon style={{ width: "24px", height: "24px" }} />
        Shipping Details
      </h2>

     
    </div>

    {/* BODY */}
    <div className="track-modal-body">

      {/* TRACKING NUMBER */}
   {/* TRACKING NUMBER */}
<div style={{ marginBottom: "20px" }}>
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: 600,
      marginBottom: "8px",
    }}
  >
    <TrackIcon
      style={{ width: "20px", height: "20px", color: "rgb(212, 122, 157)" }}
    />
    Tracking Number
  </label>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between", // <-- this pushes copy button to right
      background: "#f6f7f9",
      padding: "10px 14px",
      borderRadius: "12px",
    }}
  >
    <span style={{ fontSize: "15px", color: "#333" }}>
      {order?.trackingNumber || "Not available"}
    </span>

    {order?.trackingNumber && (
      <button
        onClick={() => navigator.clipboard.writeText(order.trackingNumber)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          opacity: 0.6,
        }}
        title="Copy"
        onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
        onMouseOut={(e) => (e.currentTarget.style.opacity = 0.6)}
      >
        📋
      </button>
    )}
  </div>
</div>



      {/* TRACKING LINK */}
      <div className="track-modal-section">
        <label className="track-modal-label">
          <span style={{ fontSize: "20px" }}>↗</span>
          Tracking Link
        </label>

        {order?.trackingLink ? (
          <a
            href={order.trackingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="tracking-link-box"
          >
            {order.trackingLink}
          </a>
        ) : (
          <p className="text-muted">Not available</p>
        )}
      </div>

    </div>
  </div>
</div>

    </>
  );
};

// Common button styles (keeping your original exactly)
const buttonBaseStyles = `
  .account-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    outline: none;
    padding: 8px 16px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .account-button:hover {
    transform: translateY(-2px);
  }

  .account-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .account-button:focus {
    box-shadow: 0 0 0 3px rgba(212, 122, 157, 0.3);
  }

  .button-icon {
    display: flex;
    align-items: center;
  }

  .icon-only {
    width: 40px;
    height: 40px;
    padding: 0;
  }

  @media (max-width: 768px) {
    .account-button {
      padding: 6px 12px;
      font-size: 0.85rem;
    }
    
    .icon-only {
      width: 36px;
      height: 36px;
    }
  }

  @media (max-width: 576px) {
    .account-button {
      padding: 5px 10px;
      font-size: 0.8rem;
    }
    
    .icon-only {
      width: 32px;
      height: 32px;
    }
  }
`;

// ✅ Updated TrackOrderButton with Modal State Management
const TrackOrderButton = ({ onClick, className, order }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasTracking =
    Boolean(order?.trackingNumber) &&
    Boolean(order?.trackingLink);

  const handleClick = () => {
    if (!hasTracking) {
      toast.info("Tracking information not available yet.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmTracking = () => {
    if (order?.trackingLink) {
      window.open(order.trackingLink, "_blank", "noopener,noreferrer");
      toast.success("Tracking link opened successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    onClick?.(order);
  };
  console.log("Track button order:", order);

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>

      <button
        className={`account-button track-button ${className || ""}`}
        onClick={handleClick}
        aria-label="Track Order"
      >
        <TrackIcon className="button-icon" />
        <span>Track Order</span>
      </button>

      <style jsx>{`
        .track-button {
          color: #fff;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        .track-button:hover {
          box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
        }
      `}</style>

      <TrackOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={order}
        onConfirm={handleConfirmTracking}
      />
    </>
  );
};


// All your other buttons remain EXACTLY the same
const SaveAddressButton = ({ onClick, className, disabled, type = "button" }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        type={type}
        className={`account-button save-button icon-only ${className || ''}`}
        onClick={onClick}
        disabled={disabled}
        aria-label="Save"
      >
        <SaveIcon className="button-icon" />
      </button>
      <style jsx>{`
        .save-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .save-button:hover:not(:disabled) {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const CancelButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
    toast.info('Action cancelled', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button cancel-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Cancel"
      >
        <CloseIcon className="button-icon" />
        <span>Cancel</span>
      </button>
      <style jsx>{`
        .cancel-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .cancel-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const EditAddressButton = ({ onClick, className, addressId }) => {
  const handleClick = () => {
    onClick(addressId);
    toast.info('Editing address', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button edit-button icon-only ${className || ''}`}
        onClick={handleClick}
        aria-label="Edit"
      >
        <EditIcon className="button-icon" />
      </button>
      <style jsx>{`
        .edit-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .edit-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const SignOutButton = ({ onClick, className }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button signout-button ${className || ''}`}
        onClick={onClick}
        aria-label="Sign Out"
      >
        <LogOutIcon className="button-icon" />
        <span>Sign Out</span>
      </button>
      <style jsx>{`
        .signout-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .signout-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const AddAddressButton = ({ onClick, className }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button add-address-button ${className || ''}`}
        onClick={onClick}
        aria-label="Add Address"
      >
        <PlusIcon className="button-icon" />
        <span>Add New Address</span>
      </button>
      <style jsx>{`
        .add-address-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .add-address-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const SetDefaultButton = ({ onClick, addressId, className }) => {
  const handleClick = () => {
    onClick(addressId);
    toast.success('Default address set successfully', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button set-default-button icon-only ${className || ''}`}
        onClick={handleClick}
        aria-label="Set Default"
      >
        <CheckCircleIcon className="button-icon" />
      </button>
      <style jsx>{`
        .set-default-button {
          color: #D47A9D;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #D47A9D;
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.2);
        }
        .set-default-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const DeleteAddressButton = ({ onClick, addressId, className }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button delete-button icon-only ${className || ''}`}
        onClick={() => onClick(addressId)}
        aria-label="Delete Address"
      >
        <TrashIcon className="button-icon" />
      </button>
      <style jsx>{`
        .delete-button {
          color: #fff;
          background: linear-gradient(135deg, #e22222 0%, #eb1e1e 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 122, 0.3);
        }
        .delete-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const ResetButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
    toast.info('Form reset', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button reset-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Reset"
      >
        <RefreshIcon className="button-icon" />
        <span>Reset</span>
      </button>
      <style jsx>{`
        .reset-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .reset-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const ViewOrderButton = ({ onClick, className, orderId, showText = true }) => {
  const handleClick = () => {
    onClick(orderId);
    toast.info('Viewing order details', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button view-button ${className || ''}`}
        onClick={handleClick}
        aria-label="View Order"
      >
        <ViewIcon className="button-icon" />
        {showText && <span>View</span>}
      </button>

      <style jsx>{`
        .view-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .view-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};


const InvoiceButton = ({ onClick, className, orderId }) => {
  const handleClick = () => {
    onClick(orderId);
    toast.info('Viewing invoice', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button invoice-button ${className || ''}`}
        onClick={handleClick}
        aria-label="View Invoice"
      >
        <InvoiceIcon className="button-icon" />
        <span>Invoice</span>
      </button>
      <style jsx>{`
        .invoice-button {
          color: #fff;
          background: linear-gradient(135deg, #6c757d 0%, #5c636a 100%);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }
        .invoice-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
        }
      `}</style>
    </>
  );
};

const CancelOrderButton = ({ onClick, className, orderId }) => {
  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button cancel-order-button ${className || ''}`}
        onClick={() => onClick(orderId)}
        aria-label="Cancel Order"
      >
        <CancelIcon className="button-icon" />
        <span>Cancel Order</span> {/* ✅ Added text */}
      </button>
      <style jsx>{`
        .cancel-order-button {
          color: #fff;
          background: linear-gradient(135deg, #e22222 0%, #eb1e1e 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .cancel-order-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};


const DownloadPDFButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
    toast.success('Invoice downloaded successfully', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button download-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Download PDF"
      >
        <DownloadIcon className="button-icon" />
        <span>Download PDF</span>
      </button>
      <style jsx>{`
        .download-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .download-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const BackButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
    toast.info('Returning to previous page', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button back-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Back"
      >
        <ArrowLeftIcon className="button-icon" />
        <span>Back</span>
      </button>
      <style jsx>{`
        .back-button {
          color: #6c757d;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #6c757d;
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
        }
        .back-button:hover {
          box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
      `}</style>
    </>
  );
};

const SubmitReturnButton = ({ onClick, className }) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button submit-return-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Submit Return"
      >
        <ReturnIcon className="button-icon" />
        <span>Submit Return</span>
      </button>
      <style jsx>{`
        .submit-return-button {
          color: #fff;
          background: linear-gradient(135deg, #D47A9D 0%, #BE6992 100%);
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.3);
        }
        .submit-return-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.4);
        }
      `}</style>
    </>
  );
};

const ReturnOrderButton = ({ onClick, className, orderId }) => {
  const handleClick = () => {
    onClick(orderId);
    toast.info('Initiating return process', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <>
      <style jsx>{buttonBaseStyles}</style>
      <button
        className={`account-button return-button ${className || ''}`}
        onClick={handleClick}
        aria-label="Return Order"
      >
        <ReturnIcon className="button-icon" />
        <span>Return</span>
      </button>
      <style jsx>{`
        .return-button {
          color: #D47A9D;
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border: 1px solid #D47A9D;
          box-shadow: 0 4px 12px rgba(212, 122, 157, 0.2);
        }
        .return-button:hover {
          box-shadow: 0 6px 16px rgba(212, 122, 157, 0.3);
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
          
      `}</style>
      <style jsx>{`
  .copy-text-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8f9fa;
    padding: 12px 14px;
    border-radius: 12px;
  }

  .tracking-text {
    font-weight: 500;
    color: #333;
    word-break: break-all;
  }

  .copy-icon-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    opacity: 0.6;
    padding: 4px;
  }

  .copy-icon-btn:hover {
    opacity: 1;
  }
`}</style>

    </>
  );
};

export {
  SaveAddressButton,
  CancelButton,
  EditAddressButton,
  SignOutButton,
  AddAddressButton,
  SetDefaultButton,
  DeleteAddressButton,
  ResetButton,
  ViewOrderButton,
  InvoiceButton,
  CancelOrderButton,
  TrackOrderButton,
  DownloadPDFButton,
  BackButton,
  SubmitReturnButton,
  ReturnOrderButton,
  TrackOrderModal // Export modal for external use if needed
};
