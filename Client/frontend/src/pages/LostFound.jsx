
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/lost-found";

const getTodayDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const emptyForm = {
  title: "",
  category: "",
  location: "",
  type: "Lost",
  description: "",
  contact: "",
  date: getTodayDate(),
};

const formatDate = (date) => {
  if (!date) return "Date not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [view, setView] = useState("All");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch reports");
      }

      setItems(data.reports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReports = async () => {
    if (!token) {
      setMyReports([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/my-reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch your reports");
      }

      setMyReports(data.reports || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshReports = async () => {
    await Promise.all([fetchReports(), fetchMyReports()]);
  };

  useEffect(() => {
    refreshReports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);

    setForm({
      title: item.title || "",
      category: item.category || "",
      location: item.location || "",
      type: item.type || "Lost",
      description: item.description || "",
      contact: item.contact || "",
      date: item.date
        ? new Date(item.date).toISOString().split("T")[0]
        : getTodayDate(),
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Please login to continue.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.contact)) {
      setError("Please enter a valid 10-digit contact number.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(
        editingId
          ? "Report updated successfully!"
          : "Report submitted successfully!"
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await refreshReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!token) {
      setError("Please login to delete your report.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete report");
      }

      setMessage("Report deleted successfully!");
      await refreshReports();
    } catch (err) {
      setError(err.message);
    }
  };

  const displayedItems =
    view === "My Reports" ? myReports : items;

  const filteredItems = displayedItems.filter((item) => {
    const matchesType =
      filter === "All" || item.type === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(searchText) ||
      item.description?.toLowerCase().includes(searchText) ||
      item.location?.toLowerCase().includes(searchText) ||
      item.category?.toLowerCase().includes(searchText);

    return matchesType && matchesSearch;
  });

  const lostCount = items.filter(
    (item) => item.type === "Lost"
  ).length;

  const foundCount = items.filter(
    (item) => item.type === "Found"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Lost & Found
            </h1>
            <p className="mt-2 text-slate-500">
              Help your campus community find their lost belongings.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow hover:bg-indigo-700"
          >
            + Report Lost / Found
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl bg-green-100 p-4 text-green-700">
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Reports</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {items.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Lost Items</p>
            <h2 className="mt-2 text-3xl font-bold text-red-500">
              {lostCount}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Found Items</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {foundCount}
            </h2>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mb-5 flex flex-wrap gap-3">
          {["All", "My Reports"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setView(tab);
                setFilter("All");
                setError("");
              }}
              className={`rounded-xl px-5 py-2.5 font-medium ${
                view === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search title, category or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >
            <option value="All">All Types</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>

        {/* Report Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? "Edit Report" : "Create Report"}
                </h2>

                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setError("");
                  }}
                  className="text-2xl text-slate-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Item Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    placeholder="Enter item name"
                    className="w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border p-3"
                    >
                      <option value="">Select category</option>
                      <option>Electronics</option>
                      <option>Books</option>
                      <option>Documents</option>
                      <option>Clothing</option>
                      <option>Accessories</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Report Type
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full rounded-xl border p-3"
                    >
                      <option value="Lost">Lost</option>
                      <option value="Found">Found</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Location
                    </label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                      placeholder="Where was it lost/found?"
                      className="w-full rounded-xl border p-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      max={getTodayDate()}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border p-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={2000}
                    required
                    rows={4}
                    placeholder="Describe the item..."
                    className="w-full rounded-xl border p-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting
                    ? "Please wait..."
                    : editingId
                    ? "Save Changes"
                    : "Submit Report"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Reports */}
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading reports...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-slate-700">
              No reports found
            </h3>
            <p className="mt-2 text-slate-500">
              {view === "My Reports"
                ? "You have not created any reports yet."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.type === "Lost"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.type}
                  </span>

                  <span className="text-xs text-slate-500">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-12 text-sm text-slate-600">
                  {item.description}
                </p>

                <div className="mt-4 space-y-2 text-sm text-slate-500">
                  <p>📍 {item.location}</p>
                  <p>📅 {formatDate(item.date)}</p>
                  <p>
                    👤 {item.reporter?.name || "Campus Student"}
                  </p>
                  {item.status && (
                    <p>
                      Status: <span className="font-medium">{item.status}</span>
                    </p>
                  )}
                </div>

                {view === "My Reports" ? (
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => openEditForm(item)}
                      className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Edit Report
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <a
                    href={`tel:${item.contact}`}
                    className="mt-5 block rounded-xl bg-indigo-50 py-3 text-center font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    Contact Reporter
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LostFound;
