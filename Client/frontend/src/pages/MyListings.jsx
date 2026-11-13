import { useEffect, useState } from "react";

function MyListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Books",
    price: "",
    condition: "Good",
  });

  const categories = [
    "Books",
    "Electronics",
    "Stationery",
    "Cycles",
    "Clothing",
    "Other",
  ];

  const conditions = ["New", "Like New", "Good", "Fair"];

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/products/my-products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch listings.");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  // Open edit popup and fill existing product details
  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      title: product.title || "",
      description: product.description || "",
      category: product.category || "Books",
      price: product.price ?? "",
      condition: product.condition || "Good",
    });
  };

  // Update form values
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save updated product
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Product update failed.");
      }

      await fetchMyProducts();
      setEditingProduct(null);

      alert("Product updated successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this product?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(productId);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Product deletion failed.");
      }

      setProducts((previous) =>
        previous.filter((product) => product._id !== productId),
      );

      alert("Product removed successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Loading your listings...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMyProducts}
          className="mt-3 bg-[#102B50] text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#102B50]">My Listings</h2>

        <p className="text-gray-500 mt-1">
          Manage the products you have listed on CampusConnect.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border">
          <h3 className="text-lg font-semibold text-[#102B50]">
            No Listings Yet
          </h3>

          <p className="text-gray-500 mt-2">
            You haven't listed any products yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {product.images?.length > 0 ? (
                <img
                  src={`http://localhost:5000${product.images[0]}`}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}

              <div className="p-5">
                <h3 className="font-bold text-lg text-[#102B50]">
                  {product.title}
                </h3>

                <p className="text-gray-500 text-sm mt-1">{product.category}</p>

                <p className="text-blue-700 text-xl font-bold mt-3">
                  ₹{product.price}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Condition: {product.condition}
                </p>

                <div className="mt-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      product.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-[#102B50] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingId === product._id}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                  >
                    {deletingId === product._id ? "Removing..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#102B50]">
                  Edit Product
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Update your product details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 text-2xl hover:text-red-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={4}
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Condition
                  </label>

                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  disabled={saving}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#102B50] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyListings;
