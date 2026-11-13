
import { useState } from "react";

function Login({ onLoginSuccess, onRegisterClick }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful!");

      onLoginSuccess();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://vikrantuniversity.ac.in/static/images/slider/apply_on.webp')",
      }}
    >
      <div className="absolute inset-0 bg-[#071D38]/65"></div>

      <div className="relative z-10 bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#10294D] text-white text-center p-6">
          <div className="text-2xl font-bold">
            VIKRANT UNIVERSITY
          </div>
          <p className="text-sm text-blue-200 mt-2">
            CampusConnect Student Portal
          </p>
        </div>

        <div className="p-7">
          <h2 className="text-2xl font-bold text-[#10294D]">
            Welcome Back!
          </h2>

          <p className="text-gray-500 text-sm mt-2 mb-6">
            Login to access your university community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-700"
              />
            </div>

            {message && (
              <p className="text-sm text-center text-red-600">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10294D] hover:bg-blue-900 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-blue-700 font-semibold"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
