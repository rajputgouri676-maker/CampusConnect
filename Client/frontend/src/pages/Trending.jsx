
import { useEffect, useState } from "react";

function Trending({ onViewDetails }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        const data = await response.json();

        if (data.success) {
          const availableProducts = (data.products || []).filter(
            (product) => product.status === "Available"
          );

          // Latest products first
          availableProducts.sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          );

          setProducts(availableProducts);
        } else {
          setError("Trending products could not be loaded.");
        }
      } catch (err) {
        setError("Server connection failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading trending products...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102B50]">
        🔥 Trending Products
      </h1>

      <p className="text-gray-500 mt-2 mb-6">
        Discover the latest products listed by university students.
      </p>

      {products.length === 0 ? (
        <p className="bg-white p-6 rounded-xl">
          No trending products available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              {product.images?.length > 0 ? (
                <img
                  src={`http://localhost:5000${product.images[0]}`}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              <div className="p-5">
                <span className="text-orange-600 text-sm font-semibold">
                  🔥 Latest Listing
                </span>

                <h2 className="font-bold text-lg text-[#102B50] mt-2">
                  {product.title}
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  {product.description}
                </p>

                <p className="text-blue-700 font-bold text-xl mt-4">
                  ₹{product.price}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Category: {product.category}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Seller: {product.seller?.name || "Student"}
                </p>

                <button
                  onClick={() => onViewDetails(product)}
                  className="w-full mt-4 bg-[#102B50] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Trending;
