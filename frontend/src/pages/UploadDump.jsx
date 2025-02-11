import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const ImageUpload = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [sharedGroupKey, setSharedGroupKey] = useState(null);
  const [successStatus,setSuccessStatus] = useState(false);
  const groupKey = localStorage.getItem('groupKey');
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please select files to upload' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('groupKey', groupKey);
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('https://groupshare-aws-1.onrender.com/api/images/upload-dump', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus({ 
          type: 'success', 
          message: 'Images uploaded successfully!' 
        });
        setSuccessStatus(true);
        setSharedGroupKey(groupKey);
        setFiles([]);
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
          <h2 className="text-xl font-semibold">Upload Images</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {files.length > 0 
                  ? `${files.length} files selected` 
                  : 'Click to select files'}
              </span>
            </label>
          </div>

          <button 
            onClick={handleUpload} 
            disabled={isUploading || files.length === 0}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${isUploading || files.length === 0 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
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
            </div>
          )}

          {sharedGroupKey && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Share this Group Key:</p>
              <p className="font-mono font-bold text-lg break-all">
                {sharedGroupKey}
              </p>
            </div>
          )}
          {successStatus && <button className="w-full py-2 my-6 px-6 text-white rounded-lg shadow-md bg-green-500 hover:bg-yellow-600 transition-colors"onClick={() => navigate("/face-upload")}>Start matching</button>}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;