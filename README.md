# Face Matching Application
[![Watch the video]([https://ibb.co/rRnMpJ2t](https://github.com/user-attachments/assets/3fddb27d-cd74-4081-a106-af71bbae5afd))](https://www.youtube.com/watch?v=pcOxdVQ2uwo)
![image](https://github.com/user-attachments/assets/a1f1756e-d1cf-4fb1-943e-dc4507d1d2b9)

![image](https://github.com/user-attachments/assets/3fddb27d-cd74-4081-a106-af71bbae5afd)

## Overview
This is a face-matching application that allows users to upload photos and find matches within a collection using AWS Rekognition. The system enables two types of users:
- **Users who want to match their face**: They upload a reference image, and the system finds matching faces from a collection of images.
- **Users who want to upload photos (dump)**: They can upload group images without registering their face.

## Features
- **User Registration**: Users register with an email and receive a `userId` and `groupKey`.
- **Face Upload & Feature Extraction**: Users can upload their face, which is indexed using AWS Rekognition.
- **Photo Upload (Dump)**: Users can upload images to the system under their `groupKey`.
- **Face Matching**: The system compares a user’s face with all images in their assigned `groupKey` and returns matched images.
- **Frontend (React + Vite)**: A clean UI that allows users to register, upload images, and view results.
- **Backend (Node.js + Express)**: Handles API requests and integrates with AWS services (S3, Rekognition, DynamoDB).

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express.js
- **AWS Services**: Rekognition, S3, DynamoDB
- **Database**: DynamoDB (stores user face metadata)
- **Storage**: Amazon S3 (stores uploaded images)

## Installation & Setup
### Prerequisites
- Node.js installed
- AWS credentials configured
- An S3 bucket and Rekognition collection set up

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/face-matching-app.git
   cd face-matching-app/backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables (`.env` file):
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   S3_BUCKET_NAME=your_bucket_name
   REKOGNITION_COLLECTION_ID=your_collection_id
   ```
4. Start the backend server:
   ```sh
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd ../frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend server:
   ```sh
   npm run dev
   ```

## API Endpoints
### User Registration
**Endpoint:** `POST /api/users/register`
```json
{
  "email": "user@example.com"
}
```
_Response:_
```json
{
  "message": "User registered",
  "user": {
    "userId": "some-unique-id",
    "groupKey": "some-group-key"
  }
}
```

### Upload Face
**Endpoint:** `POST /api/images/upload-face`
- `userId` (as form-data)
- `image` (as file)

### Upload Group Images (Dump)
**Endpoint:** `POST /api/images/upload-dump`
- `groupKey` (as form-data)
- `images[]` (multiple files)

### Match Face
**Endpoint:** `POST /api/match-face`
```json
{
  "userId": "some-user-id",
  "groupKey": "some-group-key"
}
```
_Response:_
```json
{
  "success": true,
  "matches": [
    {
      "imageUrl": "https://s3-bucket/image1.jpg",
      "similarity": 98.5
    }
  ]
}
```

## Future Enhancements
- User authentication with JWT
- Enhanced UI/UX improvements
- Support for additional image formats
- Performance optimizations

## License
This project is licensed under the MIT License.

## Author
Developed by **Aditya**

