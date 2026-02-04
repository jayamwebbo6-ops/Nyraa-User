// src/components/ReturnOrder.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SubmitReturnButton, BackButton } from "../../components/ui/Myaccountbuttons/MyAccountButtons";
import ConfirmationModal from "../../components/ui/Myaccountconformodel/ConfirmationModal";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrder, requestReturn } from "../../store/orderSlice";

const ReturnOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentOrder: order, loading, error } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const [returnReason, setReturnReason] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    dispatch(fetchOrder(orderId));
  }, [orderId, dispatch]);

  useEffect(() => {
    if (order) {
      const statusLower = order.status?.toLowerCase();
      if (statusLower !== "delivered") {
        toast.error("Only delivered orders can be returned.");
        navigate("/account/orders");
        return;
      }

      if (order.isReturnDenied) {
        toast.error("A return for this order has already been processed or denied.");
        navigate("/account/orders");
        return;
      }
      
      if (order.deliveryDate) {
        const deliveryDate = new Date(order.deliveryDate);
        const currentDate = new Date();
        const daysSinceDelivery = (currentDate - deliveryDate) / (1000 * 60 * 60 * 24);
        
        if (daysSinceDelivery > 10) {
          toast.error("The return period for this order has expired (10 days).");
          navigate("/account/orders");
        }
      }
    }
  }, [order, navigate]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReturn = () => {
    if (selectedPhotos.length === 0) {
      toast.error("Please upload at least one photo of the item.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmReturn = async () => {
    try {
      const formData = new FormData();
      formData.append("orderId", order.id);
      formData.append("reason", returnReason);
      formData.append("comments", additionalComments);
      selectedPhotos.forEach(photo => {
        formData.append("photos", photo);
      });

      await dispatch(requestReturn(formData)).unwrap();
      
      toast.success("Return request submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowConfirmModal(false);
      navigate("/account/orders");
    } catch (err) {
      toast.error(err || "Failed to submit return request");
    }
  };

  const handleCancelReturn = () => {
    setShowConfirmModal(false);
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="return-order-container">
      <h2 className="mb-4">Return Order #{order.orderNumber}</h2>
      <div className="card p-4 border-0 shadow-lg rounded-4">
        <div className="mb-4">
          <h5>Order Summary</h5>
          {order.items && order.items.map((item) => (
            <div key={item.id} className="d-flex justify-content-between mb-2">
              <p>{item.productName || item.name} (x{item.quantity})</p>
              <p>₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="d-flex justify-content-between border-top pt-2">
            <h6>Total</h6>
            <h6>₹{Number(order.total).toFixed(2)}</h6>
          </div>
        </div>

        <div className="mb-4">
          <h5>Shipping Address</h5>
          {order.shippingAddress && (
            <div className="text-muted">
              <p className="mb-1">{order.shippingAddress.name}</p>
              <p className="mb-1">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
              <p className="mb-1">{order.shippingAddress.state}, {order.shippingAddress.zip}</p>
              <p className="mb-0">{order.shippingAddress.country}</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h5>Return Details</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Return <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option value="defective">Defective Item</option>
                <option value="wrong_item">Wrong Item Shipped</option>
                <option value="not_as_described">Not as Described</option>
                <option value="changed_mind">Changed Mind</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Upload Item Photos <span className="text-danger">*</span></Form.Label>
              <div className="mb-2">
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <Form.Text className="text-muted">
                  Please upload photos showing the condition of the item. (Max 5 photos)
                </Form.Text>
              </div>
              
              <div className="d-flex gap-2 flex-wrap mb-3">
                {previews.map((preview, index) => (
                  <div key={index} className="position-relative">
                    <img 
                      src={preview} 
                      alt={`Preview ${index}`} 
                      className="rounded shadow-sm"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 py-0 px-1"
                      style={{ fontSize: '10px' }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Provide any additional details..."
              />
            </Form.Group>
          </Form>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <SubmitReturnButton
            onClick={handleSubmitReturn}
            disabled={!returnReason || selectedPhotos.length === 0}
          />
          <BackButton onClick={() => navigate(`/account/orders/${order.id}`)} />
        </div>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelReturn}
        onConfirm={handleConfirmReturn}
        title="Confirm Return Request"
        actionType="return"
        confirmButtonText="Submit Return"
      />

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
        .return-order-container {
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
        }
        h6 {
          font-size: 1rem;
          font-weight: 600;
          color: #222;
        }
        p {
          font-size: 0.9rem;
          color: #333;
        }
        .form-control,
        .form-select {
          font-size: 0.9rem;
          border-radius: 8px;
          border: 1px solid #ced4da;
        }
        .btn {
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .return-order-container {
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
          .form-control,
          .form-select {
            font-size: 0.85rem;
          }
          .btn {
            font-size: 0.85rem;
            padding: 5px 10px;
          }
        }
        @media (max-width: 576px) {
          .return-order-container {
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
          .form-control,
          .form-select {
            font-size: 0.8rem;
          }
          .btn {
            font-size: 0.8rem;
            padding: 4px 8px;
          }
          .d-flex.gap-2 {
            flex-direction: column;
            align-items: stretch;
          }
          .d-flex.gap-2 > * {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ReturnOrder;