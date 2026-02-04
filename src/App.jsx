import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/NavbarCom";
import Footer from "./components/Footer/Footer";
import BottomNavbar from "./components/BottomNavbar/BottomNavbar";
import HomePage from "./pages/HomePage";
import ProductList from "./pages/ProductList";
import SearchResults from "./pages/SearchResults";
import ProductDetail from "./pages/productdetailpage/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";
import OfferNav from "./components/OfferNav/OfferNav";
import AccountLayout from "./pages/MyAccount/AccountLayout";
import Orders from "./pages/MyAccount/Orders";
import Addresses from "./pages/MyAccount/Addresses";
import TrackOrder from "./pages/MyAccount/TrackOrder";
import Profile from "./pages/MyAccount/Profile";
import InvoiceDetail from "./pages/MyAccount/InvoiceDetail";
import ReturnOrder from "./pages/MyAccount/ReturnOrder";
import OrderDetail from "./pages/MyAccount/OrderDetail";
import PrivateRoute from "./components/routes/PrivateRoute";
import ErrorBoundary from "./components/error/ErrorBoundary";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile, logout } from "./store/authSlice";
import axios from "axios";

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn, isInitializing } = useSelector((state) => state.auth);

  // ✅ 1. Initialize Auth on Mount
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  // ✅ 2. Handle 401 Unauthorized globally
  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          dispatch(logout());
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [dispatch]);

  // ✅ LOADING state while re-authenticating (prevents redirect loops)
  if (isInitializing) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const isAuthenticated = isLoggedIn;
  console.log("App.jsx: isAuthenticated:", isAuthenticated);

  return (
    <ErrorBoundary>
      {/* ✅ FIXED: Added future flags to eliminate warnings */}
      <Router 
        basename="/nyraa"
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="app">
          <OfferNav />
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/collections/:category" element={<ProductList />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/account/profile" replace />}
            />

            {/* Private Routes */}
            <Route
              path="/cart"
              element={<PrivateRoute><Cart /></PrivateRoute>} 
            />
            <Route
              path="/wishlist"
              element={<PrivateRoute><Wishlist /></PrivateRoute>}
            />
            <Route
              path="/checkout"
              element={<PrivateRoute><Checkout /></PrivateRoute>}
            />
            {/* ✅ Matches your UpdatedCheckoutConfirmation component */}
            <Route
              path="/checkout/confirmation"
              element={<PrivateRoute><CheckoutConfirmation /></PrivateRoute>}
            />
            <Route
              path="/account"
              element={<PrivateRoute><AccountLayout /></PrivateRoute>}
            >
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId" element={<OrderDetail />} />
              <Route path="orders/:orderId/return" element={<ReturnOrder />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="track" element={<TrackOrder />} />
              <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
            </Route>
          </Routes>
          <BottomNavbar />
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
