import { useState } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import BuyProducts from "./pages/BuyProducts";
import ProductDetails from "./pages/ProductDetails";
import SellProduct from "./pages/SellProduct";
import MyListings from "./pages/MyListings";
import Profile from "./pages/Profile";
import Trending from "./pages/Trending";
import Chatbot from "./pages/Chatbot";
import LostFound from "./pages/LostFound";

import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token"),
  );

  const [authPage, setAuthPage] = useState(() =>
    localStorage.getItem("hasRegistered") === "true" ? "login" : "register",
  );

  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previousPage, setPreviousPage] = useState("Buy Products");

  const handleLoginSuccess = () => {
    localStorage.setItem("hasRegistered", "true");
    setIsLoggedIn(true);
    setActivePage("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setAuthPage("login");
    setSelectedProduct(null);
    setActivePage("Dashboard");
  };

  // Open product details from Buy, Trending or Chatbot
  const handleViewDetails = (product) => {
    setPreviousPage(activePage);
    setSelectedProduct(product);
    setActivePage("Product Details");
  };

  if (!isLoggedIn) {
    if (authPage === "register") {
      return <Register onLoginClick={() => setAuthPage("login")} />;
    }

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={() => setAuthPage("register")}
      />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard setActivePage={setActivePage} />;
      case "Buy Products":
        return <BuyProducts onViewDetails={handleViewDetails} />;

      case "Product Details":
        return (
          <ProductDetails
            product={selectedProduct}
            onBack={() => setActivePage(previousPage)}
          />
        );

      case "Sell Products":
        return <SellProduct />;

      case "My Listings":
        return <MyListings />;

      case "My Profile":
        return <Profile onBack={() => setActivePage("Dashboard")} />;

      case "Trending":
        return <Trending onViewDetails={handleViewDetails} />;

      case "Chatbot":
        return <Chatbot onViewDetails={handleViewDetails} />;

      case "Lost & Found":
        return <LostFound />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <Navbar
        onLogout={handleLogout}
        onProfileClick={() => setActivePage("My Profile")}
      />

      <div className="flex">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <main className="flex-1 p-6 min-w-0">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
