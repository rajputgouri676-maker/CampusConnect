
import { useEffect, useState } from "react";

function Profile({ onBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    branch: "",
    allowContact: false,
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const API_URL = "http://127.0.0.1:5000";

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch profile");
      }

      setUser(data.user);

      setFormData({
        name: data.user.name || "",
        mobile: data.user.mobile || "",
        branch: data.user.branch || "",
        allowContact: data.user.allowContact === true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const profilePhoto = user?.profilePhoto
    ? `${API_URL}${user.profilePhoto}`
    : "";

  const handleEdit = () => {
    setFormData({
      name: user.name || "",
      mobile: user.mobile || "",
      branch: user.branch || "",
      allowContact: user.allowContact === true,
    });

    setSelectedPhoto(null);
    setPhotoPreview(profilePhoto);
    setMessage("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPhoto(null);
    setPhotoPreview("");
    setMessage("");
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should not exceed 2 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.name.trim() || !formData.branch.trim()) {
      setError("Name and branch are required.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      const form = new FormData();

      form.append("name", formData.name.trim());
      form.append("mobile", formData.mobile.trim());
      form.append("branch", formData.branch.trim());
      form.append("allowContact", String(formData.allowContact));

      if (selectedPhoto) {
        form.append("profilePhoto", selectedPhoto);
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed");
      }

      setUser(data.user);

      setFormData({
        name: data.user.name || "",
        mobile: data.user.mobile || "",
        branch: data.user.branch || "",
        allowContact: data.user.allowContact === true,
      });

      localStorage.setItem("user", JSON.stringify(data.user));

      setSelectedPhoto(null);
      setPhotoPreview("");
      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#10294D]">
        Loading profile...
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <p className="text-red-600">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 bg-[#10294D] text-white px-5 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#10294D]">
            My Profile
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Your CampusConnect student information
          </p>
        </div>

        <button
          onClick={onBack}
          className="bg-[#10294D] hover:bg-blue-900 text-white px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-[#10294D] h-32"></div>

        <div className="px-6 pb-7">
          <div className="-mt-14 mb-5">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-[#173B67] text-white flex items-center justify-center text-4xl font-bold overflow-hidden">
              {(isEditing ? photoPreview : profilePhoto) ? (
                <img
                  src={isEditing ? photoPreview : profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {!isEditing ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-bold text-[#10294D]">
                    {user.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {user.role || "Student"}
                  </p>
                </div>

                <button
                  onClick={handleEdit}
                  className="bg-[#10294D] hover:bg-blue-900 text-white px-5 py-2 rounded-lg"
                >
                  Edit Profile
                </button>
              </div>

              <div className="border-t mt-6 pt-6">
                <h4 className="text-lg font-semibold text-[#10294D] mb-5">
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {user.name || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-800 mt-1 break-all">
                      {user.email || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Mobile Number</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {user.mobile || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {user.branch || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">University</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {user.university || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Buyer Contact Permission
                    </p>
                    <p className={`font-medium mt-1 ${
                      user.allowContact ? "text-green-600" : "text-gray-500"
                    }`}>
                      {user.allowContact
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSave}>
              <h3 className="text-xl font-bold text-[#10294D] mb-5">
                Edit Profile Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    required
                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University
                  </label>
                  <input
                    type="text"
                    value={user.university || ""}
                    disabled
                    className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500"
                  />
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowContact}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          allowContact: e.target.checked,
                        }))
                      }
                      className="mt-1 w-4 h-4 accent-[#10294D]"
                    />

                    <span>
                      <span className="block font-semibold text-[#10294D]">
                        Allow buyers to contact me
                      </span>
                      <span className="block text-sm text-gray-600 mt-1">
                        If enabled, logged-in buyers can view your contact
                        details after clicking Contact Seller on your product.
                        You can turn this off anytime.
                      </span>
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Change Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or WEBP. Maximum size: 2 MB.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#10294D] hover:bg-blue-900 disabled:opacity-60 text-white px-6 py-2 rounded-lg"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
