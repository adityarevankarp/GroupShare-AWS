import { v4 as uuidv4 } from "uuid";
import dynamoDB from "../db/dynamoClient.js";
import User from "../models/User.js";

const USERS_TABLE = "USERS_TABLE"; // DynamoDB table name

const createUser = async (email) => {
  const userId = uuidv4(); // Unique User ID
  const groupKey = uuidv4(); // Unique Group Key

  const user = new User(userId, email, groupKey);

  const params = {
    TableName: USERS_TABLE,
    Item: user.toDynamoDBItem(),
  };

  try {
    await dynamoDB.put(params).promise();
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Database Error");
  }
};

const getUserByEmail = async (email) => {
  const params = {
    TableName: USERS_TABLE,
    IndexName: "email-index", // Assuming GSI on email
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Database Error");
  }
};

export { createUser, getUserByEmail };
