import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const FaceUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [successStatus,setSuccessStatus] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Optional: Check if file is an image
      if (!selectedFile.type.startsWith('image/')) {
        setUploadStatus({ 
          type: 'error', 
          message: 'Please select an image file' 
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({ type: 'error', message: 'Please select a selfie to upload' });
      return;
    }

    if (!userId) {
      setUploadStatus({ type: 'error', message: 'User ID not found' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('image', file);

    try {
      const response = await fetch('https://groupshare-aws-1.onrender.com/api/images/upload-face', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus({ 
          type: 'success', 
          message: 'Face uploaded successfully!' 
        });
        setFile(null);
        setSuccessStatus(true)
        
        // Reset the input
        const fileInput = document.getElementById('face-upload');
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.message 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Upload Selfie</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="face-upload"
            />
            <label 
              htmlFor="face-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <Camera className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {file 
                  ? file.name 
                  : 'Click to select selfie'}
              </span>
            </label>
          </div>

          <button 
            onClick={handleUpload} 
            disabled={isUploading || !file}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${isUploading || !file 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isUploading ? 'Uploading...' : 'Upload Selfie'}
          </button>

          {uploadStatus && (
            <div className={`p-4 rounded-md ${
              uploadStatus.type === 'error' 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              <p className="font-medium">
                {uploadStatus.type === 'error' ? 'Error' : 'Success'}
              </p>
              <p className="text-sm">
                {uploadStatus.message}
              </p>
              {successStatus && <button className="w-full py-2 my-6 px-6 text-white rounded-lg shadow-md bg-green-500 hover:bg-yellow-600 transition-colors"onClick={() => navigate("/match-face")}>Start matching</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceUpload;