import React, { useState } from 'react';

const FaceMatchResults = () => {
  const [groupKey, setGroupKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  const handleMatch = async () => {
    // Get userId from localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User ID not found in local storage');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/images/match-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          groupKey,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMatches(data.matches);
      } else {
        setError('Failed to fetch matches');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter Group Key"
            value={groupKey}
            onChange={(e) => setGroupKey(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleMatch}
            disabled={loading || !groupKey}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Matching...
              </>
            ) : (
              'Find Matches'
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match, index) => (
              <div key={index} className="relative">
                <img
                  src={match.imageUrl}
                  alt={`Match ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                  <p className="text-sm">
                    Similarity: {match.similarity.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && matches.length === 0 && !error && (
          <p className="text-center text-gray-500">
            No matches found. Try a different group key.
          </p>
        )}
      </div>
    </div>
  );
};

export default FaceMatchResults;