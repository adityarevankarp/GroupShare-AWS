import AWS from "aws-sdk";

AWS.config.update({ region: "us-east-1" });
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "GroupImages";

export const saveImages = async (groupKey, imageUrls) => {
    if (!groupKey || !imageUrls.length) {
        throw new Error("Missing groupKey or imageUrls");
    }

    // Ensure groupKey is a string
    const formattedGroupKey = String(groupKey);

    const putRequests = imageUrls.map((url) => ({
        PutRequest: {
            Item: {
                groupKey: { S: String(groupKey) },  // Changed to use DynamoDB attribute type
                imageUrl: { S: String(url) } // 🔴 Ensure this is a string
            },
        },
    }));

    console.log("Saving to DynamoDB:", JSON.stringify(putRequests, null, 2));

    const params = {
        RequestItems: {
            [TABLE_NAME]: putRequests,
        },
    };

    try {
        const result = await dynamoDB.batchWrite(params).promise();
        console.log("DynamoDB Write Success:", result);
        return result;
    } catch (error) {
        console.error("DynamoDB Error:", error);
        throw error;
    }
};