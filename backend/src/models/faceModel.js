import AWS from "aws-sdk";

AWS.config.update({ region: "us-east-1" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();

 // New table for storing faceprints
const TABLE_NAME = "usrfprints";
export const saveFaceprint = async (userId, faceId, s3Url) => {
    console.log("usrid in saving faceprint",userId)
    
    const params = {
        TableName: TABLE_NAME,
        Item: {
            userId,
            faceId,
            s3Url,
            createdAt: new Date().toISOString(),
        },
    };

    try {
        await dynamoDB.put(params).promise();
        console.log("✅ Faceprint saved to DynamoDB:", params.Item);
    } catch (error) {
        console.error("❌ DynamoDB Error:", error);
        throw error;
    }
};
export const getFaceprint = async (userId) => {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    };

    try {
        const result = await dynamoDB.query(params).promise();
        if (!result.Items || result.Items.length === 0) {
            console.log("❌ No face data found for userId:", userId);
            return null;
        }
        console.log("✅ Retrieved face data:", result.Items[0]); // Getting first item since we expect one faceId per userId
        return result.Items[0];
    } catch (error) {
        console.error("❌ DynamoDB Query Error:", error);
        throw error;
    }
};