// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import './LandingPage.css'
// const LandingPage = () => {
//     const navigate = useNavigate();
//     const [isRegistered, setIsRegistered] = useState(false);

//     useEffect(() => {
//         const userId = localStorage.getItem("userId");
//         if (userId) {
//             setIsRegistered(true);
//         }
//     }, []);

//     const navigationButtons = [
//         {
//             text: "Upload Selfie",
//             path: "/face-upload",
//             className: "bg-blue-500 hover:bg-blue-600"
//         },
//         {
//             text: "Upload Dump",
//             path: "/upload-dump",
//             className: "bg-green-500 hover:bg-green-600"
//         },
//         {
//             text: "Download your images",
//             path: "/match-face",
//             className: "bg-green-500 hover:bg-green-600"
//         }
//     ];

//     return (
//         <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//             <h4>Think before you click! Every reckless test means one more tear rolling down my AWS billing statement. 😭💰😂  .</h4>
            
//             <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
//                 <h1 className="text-3xl font-bold text-center mb-6">
//                     Welcome to GroupShare
//                 </h1>
//                 <div className="space-y-4">
//                     {navigationButtons.map((button) => (
//                         <button
//                             key={button.path}
//                             className={`w-full py-3 px-6 text-white rounded-lg shadow-md transition-colors ${button.className}`}
//                             onClick={() => navigate(button.path)}
//                         >
//                             {button.text}
//                         </button>
//                     ))}
                    
//                     {!isRegistered ? (
//                         <button
//                             className="w-full py-3 px-6 text-white rounded-lg shadow-md bg-yellow-500 hover:bg-yellow-600 transition-colors"
//                             onClick={() => navigate("/register")}
//                         >
//                             Register
//                         </button>
//                     ) : (
//                         <p className="text-gray-700 text-center">
//                             You are already registered Just Proceed.
//                         </p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LandingPage;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isRegistered, setIsRegistered] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h4 className="mb-4 text-center text-gray-700">
                Think before you click! Every reckless test means one more tear rolling down my AWS billing statement. 😭💰😂
            </h4>
            
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
                            You are already registered. Just proceed.
                        </p>
                    )}
                </div>
            </div>

            {/* How to Use Section */}
            <div className="w-full max-w-md mt-6">
                <button
                    className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                    onClick={() => setShowInstructions(!showInstructions)}
                >
                    {showInstructions ? "Hide Instructions" : "How to Use?"}
                </button>

                {showInstructions && (
                    <div className="bg-white mt-4 p-4 rounded-lg shadow-lg text-gray-800">
                        <h2 className="text-xl font-bold">📌 How to Use GroupShare</h2>
                        <p className="mt-2"><strong>Scenario:</strong> Find yourself in group photos effortlessly!</p>
                        <p className = "pl-5 mt-2 space-y-2">Imagine you attended a big event, a family gathering, or a college fest where tons of pictures were taken. Instead of manually searching through hundreds of photos, you can simply upload your face and let our AI find all the images where you appear!</p>
                        <ol className="list-decimal pl-5 mt-2 space-y-2">
                            <li><strong>Register:</strong> Click "Register" and enter your email. Get a unique Group Key.</li>
                            <li><strong>Upload Dump:</strong> Add group photos for processing.</li>
                            <li><strong>Match My Face:</strong> Upload your selfie to find yourself in the uploaded images.</li>
                            <li><strong>View & Download:</strong> See matched images and download them.</li>
                            <li><strong>Share Group Key:</strong> Invite others to upload and search their images!</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;
