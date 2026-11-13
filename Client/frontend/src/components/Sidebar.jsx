
function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Buy Products", icon: "🛍️" },
    { name: "Sell Products", icon: "➕" },
    { name: "My Listings", icon: "📦" },
    { name: "Trending", icon: "🔥" },
    { name: "Lost & Found", icon: "🔍" },
    { name: "Chatbot", icon: "💬" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white p-5">
      <h2 className="text-xs font-bold text-gray-400 tracking-widest mb-5">
        STUDENT SERVICES
      </h2>

      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <button
              onClick={() => setActivePage(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                activePage === item.name
                  ? "bg-[#102B50] text-white shadow-md"
                  : "text-gray-700 hover:bg-[#EAF1F8] hover:text-[#102B50]"
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium text-sm">
                {item.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-10 p-4 rounded-lg bg-[#EAF1F8]">
        <p className="font-semibold text-[#102B50] text-sm">
          Vikrant University
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Connecting students, building community.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
