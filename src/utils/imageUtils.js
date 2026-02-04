export const normalizeImagePath = (path) => {
    if (!path || path === "/placeholder.svg" || path.includes("placeholder.svg")) {
        return "https://via.placeholder.com/300x400?text=Nyraa+Product";
    }

    if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
        return path;
    }

    // Base URL for the backend
    const BASE_URL = "http://localhost:5000";

    // Ensure we don't double slash
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    return `${BASE_URL}/${cleanPath}`;
};
