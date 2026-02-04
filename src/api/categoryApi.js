const BASE_URL = "http://localhost:5000";

export const fetchCategories = async () => {
  const response = await fetch(`${BASE_URL}/api/categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await response.json();
  console.log("🛒 RAW CATEGORY RESPONSE =>", data);

  if (!data.success) {
    throw new Error(data.message || "Category API failed");
  }

  // ✅ CORRECT PATH
  const list = Array.isArray(data.data?.categories)
    ? data.data.categories
    : [];

  console.log("📋 CATEGORY LIST =>", list);

  return list; // ✅ returns categories array
};
