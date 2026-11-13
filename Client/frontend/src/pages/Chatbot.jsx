
import { useState } from "react";

const API_URL = "http://localhost:5000/api/products";

function Chatbot({ onViewDetails }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 Welcome to CampusConnect. Tell me what product you are looking for. I will search the available listings for you!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const categoryKeywords = {
    Books: ["book", "books", "textbook", "novel", "notes"],
    Electronics: [
      "electronic", "electronics", "laptop", "mobile",
      "phone", "headphone", "headphones", "mouse",
      "keyboard", "charger", "speaker", "tablet"
    ],
    Stationery: [
      "stationery", "pen", "pencil", "notebook",
      "register", "stationary"
    ],
    Cycles: ["cycle", "cycles", "bicycle"],
    Clothing: ["clothing", "clothes", "shirt", "jeans", "dress"],
  };

  const stopWords = [
    "i", "want", "need", "looking", "for", "a", "an", "the",
    "is", "are", "do", "you", "have", "any", "available",
    "please", "show", "me", "find", "search", "give",
    "mujhe", "chahiye", "kya", "hai", "koi", "ka", "ki",
    "ke", "mein", "me", "par", "under", "below", "less",
    "than", "rupees", "rupee", "rs", "rupaye", "rupay",
    "tak", "andar", "budget", "sell", "selling", "bik",
    "raha", "rhi", "rahe", "kar", "raha", "karta"
  ];

  const getBudget = (text) => {
    const patterns = [
      /(?:under|below|less than|upto|up to)\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
      /(?:₹|rs\.?|rupees?)\s*(\d+)\s*(?:ke\s*)?(?:under|below|tak|andar)/i,
      /(\d+)\s*(?:rupees?|rs\.?)?\s*(?:ke\s*)?(?:under|below|tak|andar)/i,
      /budget\s*(?:of\s*)?(?:₹|rs\.?)?\s*(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return Number(match[1]);
    }

    return null;
  };

  const getCategory = (text) => {
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((word) => text.includes(word))) {
        return category;
      }
    }

    return null;
  };

  const searchProducts = async (message) => {
    const text = message.toLowerCase();
    const budget = getBudget(text);
    const category = getCategory(text);

    const words = text
      .replace(/[₹,?!.'"]/g, " ")
      .split(/\s+/)
      .filter((word) =>
        word.length > 1 &&
        !stopWords.includes(word) &&
        !/^\d+$/.test(word)
      );

    // Fetch available products from all API pages
    const firstResponse = await fetch(`${API_URL}?page=1&limit=100`);
    const firstData = await firstResponse.json();

    if (!firstResponse.ok || !firstData.success) {
      throw new Error("Could not fetch products.");
    }

    let allProducts = firstData.products || [];

    const totalPages = firstData.totalPages || 1;

    for (let page = 2; page <= totalPages; page++) {
      const response = await fetch(
        `${API_URL}?page=${page}&limit=100`
      );

      const data = await response.json();

      if (data.success) {
        allProducts = [...allProducts, ...(data.products || [])];
      }
    }

    // Match user query with actual product details
    let results = allProducts.filter((product) => {
      const productText = [
        product.title,
        product.description,
        product.category
      ]
        .join(" ")
        .toLowerCase();

      const matchesCategory =
        !category || product.category === category;

      const matchesBudget =
        budget === null || Number(product.price) <= budget;

      const matchesKeyword =
        words.length === 0 ||
        words.some((word) => productText.includes(word));

      return (
        product.status === "Available" &&
        matchesCategory &&
        matchesBudget &&
        matchesKeyword
      );
    });

    results.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    return {
      products: results.slice(0, 10),
      budget,
      category,
    };
  };

  const sendMessage = async (message = input) => {
    const userMessage = message.trim();

    if (!userMessage || loading) return;

    setInput("");
    setLoading(true);

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: userMessage },
    ]);

    try {
      const result = await searchProducts(userMessage);

      let reply = "";

      if (result.products.length > 0) {
        reply = `Great! 🎉 I found ${result.products.length} matching product(s) in CampusConnect listings.`;
      } else {
        reply = "Sorry! 😕 No matching available products found.";

        if (result.budget !== null) {
          reply += ` Your budget was ₹${result.budget}.`;
        }

        reply += " Try another product name, category or budget.";
      }

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: reply,
          products: result.products,
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "Unable to connect to the product server. Please check whether your backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "Hello! 👋 Welcome to CampusConnect. What product are you looking for?",
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">

      {/* Header */}
      <div className="bg-[#102B50] text-white p-5 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            💬 CampusConnect Chatbot
          </h1>
          <p className="text-sm text-blue-100 mt-1">
            Student Marketplace Assistant
          </p>
        </div>

        <button
          onClick={clearChat}
          className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="h-[500px] overflow-y-auto p-5 space-y-5 bg-gray-50">

        {messages.map((message, index) => (
          <div key={index}>
            <div
              className={`flex ${
                message.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl text-sm leading-6 ${
                  message.sender === "user"
                    ? "bg-[#102B50] text-white rounded-br-none"
                    : "bg-white border text-gray-700 rounded-bl-none shadow-sm"
                }`}
              >
                {message.text}
              </div>
            </div>

            {/* Actual Database Products */}
            {message.products?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {message.products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white border rounded-xl overflow-hidden shadow-sm"
                  >
                    {product.images?.length > 0 ? (
                      <img
                        src={`http://localhost:5000${product.images[0]}`}
                        alt={product.title}
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div className="h-36 bg-gray-100 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="font-bold text-[#102B50]">
                        {product.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {product.category} • {product.condition}
                      </p>

                      <p className="text-lg font-bold text-blue-700 mt-2">
                        ₹{product.price}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Seller: {product.seller?.name || "Student"}
                      </p>

                      <button
                        onClick={() => onViewDetails(product)}
                        className="w-full mt-3 bg-[#102B50] text-white py-2 rounded-lg hover:bg-blue-900"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <p className="text-sm text-gray-500">
            Searching available products...
          </p>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="e.g. I need a laptop under 20000..."
          className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300"
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-[#102B50] text-white px-6 rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
