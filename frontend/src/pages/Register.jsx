import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleRegister = async () => {
        if (localStorage.getItem("groupKey") && localStorage.getItem("userId")) {
            alert("You are already registered!");
            return;
        }

        if (!email) {
            setError("Email is required!");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await axios.post("http://localhost:5000/api/users/register", { email });

            const { userId, groupKey } = response.data.user;
            localStorage.setItem("groupKey", groupKey);
            localStorage.setItem("userId", userId);

            setSuccess(true);
            
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-semibold text-center mb-4">Register</h2>

                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-2 border rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                {success && <p className="text-green-500 text-sm mb-2">Registration successful!</p>}

                <button
                    onClick={handleRegister}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
                {success && <button className="w-full py-2 my-6 px-6 text-white rounded-lg shadow-md bg-yellow-500 hover:bg-yellow-600 transition-colors"onClick={() => navigate("/upload-dump")}>Proceed to Dump Images</button>}
                {success && <button className="w-full py-2 my-6 px-6 text-white rounded-lg shadow-md bg-green-500 hover:bg-yellow-600 transition-colors"onClick={() => navigate("/face-upload")}>Download your images</button>}
                
            </div>
        </div>
    );
};

export default Register;
