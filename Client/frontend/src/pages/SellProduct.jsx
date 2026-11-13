
import { useState } from "react";

function SellProduct() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    condition: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);

    if (selectedImages.length > 5) {
      setError("You can upload a maximum of 5 images.");
      e.target.value = "";
      return;
    }

    setError("");
    setImages(selectedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first.");
      }

      let uploadedImages = [];

      // Upload images first
      if (images.length > 0) {
        const imageFormData = new FormData();

        images.forEach((image) => {
          imageFormData.append("images", image);
        });

        const uploadResponse = await fetch(
          "http://localhost:5000/api/products/upload-images",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageFormData,
          }
        );

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Image upload failed.");
        }

        uploadedImages = uploadData.images || [];
      }

      // Save product details
      const productResponse = await fetch(
        "http://localhost:5000/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            images: uploadedImages,
          }),
        }
      );

      const productData = await productResponse.json();

      if (!productResponse.ok || !productData.success) {
        throw new Error(productData.message || "Product could not be added.");
      }

      setMessage("Your product has been listed successfully!");

      setFormData({
        title: "",
        description: "",
        category: "",
        price: "",
        condition: "",
      });

      setImages([]);

      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#102B50]">
          Sell Your Product
        </h1>
        <p className="text-gray-500 mt-2">
          List your product and connect with other university students.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-xl shadow-sm border space-y-5"
      >
        {message && (
          <p className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
            {message}
          </p>
        )}

        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </p>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter product name"
            required
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
            placeholder="Describe your product..."
            rows="4"
            required
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>
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
              placeholder="Enter price"
              min="1"
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Condition
          </label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full border rounded-lg p-3"
          />
          <p className="text-xs text-gray-500 mt-2">
            You can select up to 5 images.
          </p>

          {images.length > 0 && (
            <p className="text-sm text-blue-700 mt-2">
              {images.length} image(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#102B50] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-60"
        >
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default SellProduct;
