
import { useState } from "react";

function Navbar({ onLogout, onProfileClick }) {
  const [showProfile, setShowProfile] = useState(false);
  const [imageError, setImageError] = useState(false);

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch (error) {
    user = {};
  }

  const userName = user.name || "Student";
  const userEmail = user.email || "Student Account";

  const profilePhoto = user.profilePhoto
    ? `http://127.0.0.1:5000${user.profilePhoto}`
    : "";

  const showDefaultAvatar = !profilePhoto || imageError;

  const handleProfileClick = () => {
    setShowProfile(false);
    onProfileClick();
  };

  return (
    <header className="bg-white px-6 md:px-10 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* CampusConnect Branding */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#10294D] text-white flex items-center justify-center font-bold text-lg">
            CC
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#10294D]">
              CampusConnect
            </h1>
            <p className="text-xs text-gray-500">
              University Student Platform
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#10294D] text-white flex items-center justify-center font-bold text-lg overflow-hidden">
              {showDefaultAvatar ? (
                userName.charAt(0).toUpperCase()
              ) : (
                <img
                  src={profilePhoto}
                  alt={userName}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-[#10294D]">
                {userName}
              </p>
              <p className="text-xs text-gray-500">
                Student
              </p>
            </div>

            <span className="text-gray-500 text-sm">▼</span>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border z-50">

              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#10294D] text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
                  {showDefaultAvatar ? (
                    userName.charAt(0).toUpperCase()
                  ) : (
                    <img
                      src={profilePhoto}
                      alt={userName}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-[#10294D]">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 break-all">
                    {userEmail}
                  </p>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                >
                  👤 My Profile
                </button>

                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  ↪ Logout
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
