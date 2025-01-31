import axios from "axios";

export const sendTransactionData = async (endpoint, data) => {
    const token = localStorage.getItem('authToken');

  if (!token) {
    alert("You are not logged in.");
    return;
  }

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/transactions/${endpoint}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred";
    console.error(errorMessage);
    alert(errorMessage); 
    throw error;
  }
};
