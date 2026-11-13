
import { useEffect, useState } from "react";

function BuyProducts({ onViewDetails }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();

        if (data.success) {
          setProducts(data.products || []);
        } else {
          setError("Products could not be loaded.");
        }
      } catch (err) {
        setError("Server connection failed. Please start your backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading products...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102B50]">
        Student Marketplace
      </h1>

      <p className="text-gray-500 mt-2 mb-6">
        Explore products listed by Vikrant University students.
      </p>

      {products.length === 0 ? (
        <p className="bg-white p-6 rounded-xl">
          No products available right now.
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
                <h2 className="font-bold text-lg text-[#102B50]">
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

export default BuyProducts;
