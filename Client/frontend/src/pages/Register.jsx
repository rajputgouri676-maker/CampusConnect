
import { useEffect, useState } from "react";

function Register({ onLoginClick }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    branch: "",
    university: "Vikrant University",
    password: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Photo size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    setMessage("");
    setProfilePhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const registrationData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        registrationData.append(key, value);
      });

      // Photo is optional
      if (profilePhoto) {
        registrationData.append("profilePhoto", profilePhoto);
      }

      const response = await fetch(
        "http://127.0.0.1:5000/api/auth/register",
        {
          method: "POST",
          body: registrationData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage("Registration successful! Redirecting to login...");

      console.log("Registered User:", data.user);

      // Save registration status permanently in localStorage
      localStorage.setItem("hasRegistered", "true");

      // Automatically open Login Page after 1.5 seconds
      setTimeout(() => {
        onLoginClick();
      }, 1500);

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
            Create Account
          </h2>

          <p className="text-gray-500 text-sm mt-2 mb-6">
            Register to join your university community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-700"
              />
            </div>

            {/* Email */}
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

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Mobile Number
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                pattern="[6-9][0-9]{9}"
                maxLength="10"
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-700"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Branch
              </label>

              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Enter your branch (e.g. CSE)"
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-700"
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-medium mb-1">
                University
              </label>

              <input
                type="text"
                name="university"
                value={formData.university}
                readOnly
                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100"
              />
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Photo
                <span className="text-gray-400 font-normal">
                  {" "}(Optional)
                </span>
              </label>

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-full bg-[#10294D] text-white flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (formData.name.trim().charAt(0) || "S").toUpperCase()
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#10294D] file:text-white file:cursor-pointer"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG or WEBP. Maximum 2 MB.
                  </p>
                </div>

              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (minimum 8 characters)"
                minLength={8}
                required
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-700"
              />
            </div>

            {/* Message */}
            {message && (
              <p className="text-sm text-center font-medium text-blue-700">
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10294D] hover:bg-blue-900 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{" "}

            <button
              type="button"
              onClick={onLoginClick}
              className="text-blue-700 font-semibold cursor-pointer"
            >
              Login
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;
