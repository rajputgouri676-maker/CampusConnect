
import { useEffect, useState } from "react";

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/products/my-products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load your products.");
        return;
      }

      setProducts(data.products || []);
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this product?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to remove product.");
        return;
      }

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );

      alert("Product removed successfully!");
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading your products...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#102B50]">
        My Products
      </h1>

      <p className="text-gray-500 mt-2 mb-6">
        Manage the products you have listed on CampusConnect.
      </p>

      {products.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border text-gray-500">
          You have not listed any products yet.
        </div>
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

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() =>
                      alert("Edit functionality will be added next.")
                    }
                    className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProducts;
