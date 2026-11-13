
import { useState } from "react";

function ProductDetails({ product, onBack }) {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!product) {
    return <p className="p-6">Product not found.</p>;
  }

  const handleContactSeller = async () => {
    try {
      setLoading(true);
      setError("");
      setSeller(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to contact the seller.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/products/${product._id}/contact`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to fetch seller details.");
        return;
      }

      setSeller(data.seller);
    } catch (error) {
      console.error("Contact seller error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="text-[#102B50] font-semibold mb-6 hover:underline"
      >
        ← Back to Products
      </button>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            {product.images?.length > 0 ? (
              <img
                src={`http://localhost:5000${product.images[0]}`}
                alt={product.title}
                className="w-full h-80 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[#102B50]">
              {product.title}
            </h1>

            <p className="text-blue-700 text-2xl font-bold mt-4">
              ₹{product.price}
            </p>

            <div className="mt-6 space-y-3 text-gray-600">
              <p>
                <strong>Category:</strong> {product.category}
              </p>

              <p>
                <strong>Condition:</strong> {product.condition}
              </p>

              <p>
                <strong>Seller:</strong>{" "}
                {product.seller?.name || "Student"}
              </p>

              <p>
                <strong>Branch:</strong>{" "}
                {product.seller?.branch || "Not available"}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="font-bold text-lg text-[#102B50]">
                Product Description
              </h2>

              <p className="text-gray-600 mt-2">
                {product.description}
              </p>
            </div>

            <button
              onClick={handleContactSeller}
              disabled={loading}
              className="w-full mt-8 bg-[#102B50] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Contact Seller"}
            </button>

            {error && (
              <p className="mt-4 text-red-600 text-sm">
                {error}
              </p>
            )}

            {seller && (
              <div className="mt-5 p-4 border rounded-lg bg-gray-50">
                <h2 className="font-bold text-lg text-[#102B50]">
                  Seller Contact Details
                </h2>

                <p className="mt-3">
                  <strong>Name:</strong> {seller.name}
                </p>

                <p className="mt-2">
                  <strong>Email:</strong> {seller.email || "Not available"}
                </p>

                <p className="mt-2">
                  <strong>Mobile:</strong> {seller.mobile || "Not available"}
                </p>

                {seller.email && (
                  <a
                    href={`mailto:${seller.email}`}
                    className="inline-block mt-4 mr-3 bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Send Email
                  </a>
                )}

                {seller.mobile && (
                  <a
                    href={`tel:${seller.mobile}`}
                    className="inline-block mt-4 bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Call Seller
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
