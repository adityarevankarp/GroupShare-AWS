import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './LandingPage.css'
const LandingPage = () => {
    const navigate = useNavigate();
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            setIsRegistered(true);
        }
    }, []);

    const navigationButtons = [
        {
            text: "Upload Selfie",
            path: "/face-upload",
            className: "bg-blue-500 hover:bg-blue-600"
        },
        {
            text: "Upload Dump",
            path: "/upload-dump",
            className: "bg-green-500 hover:bg-green-600"
        },
        {
            text: "Download your images",
            path: "/match-face",
            className: "bg-green-500 hover:bg-green-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <h4>Think before you click! Every reckless test means one more tear rolling down my AWS billing statement. 😭💰😂  .</h4>
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Welcome to GroupShare
                </h1>
                <div className="space-y-4">
                    {navigationButtons.map((button) => (
                        <button
                            key={button.path}
                            className={`w-full py-3 px-6 text-white rounded-lg shadow-md transition-colors ${button.className}`}
                            onClick={() => navigate(button.path)}
                        >
                            {button.text}
                        </button>
                    ))}
                    
                    {!isRegistered ? (
                        <button
                            className="w-full py-3 px-6 text-white rounded-lg shadow-md bg-yellow-500 hover:bg-yellow-600 transition-colors"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                    ) : (
                        <p className="text-gray-700 text-center">
                            You are already registered Just Proceed.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;