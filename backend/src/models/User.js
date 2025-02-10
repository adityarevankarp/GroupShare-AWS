class User {
    constructor(userId, email, groupKey) {
      this.userId = userId;
      this.email = email;
      this.groupKey = groupKey;
    }
  
    toDynamoDBItem() {
      return {
        userId: this.userId,
        email: this.email,
        groupKey: this.groupKey,
      };
    }
  }
  
  export default User;
  