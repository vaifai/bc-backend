const AWS = require('aws-sdk');

// Configure AWS SDK

const createUserCredentialsTable = async () => {
  AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.secret_key
  });
  
  const dynamodb = new AWS.DynamoDB();
  const params = {
    TableName: 'UserCredentials',
    KeySchema: [
      { AttributeName: 'email', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    }
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log('UserCredentials table created successfully');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('UserCredentials table already exists');
    } else {
      console.error('Error creating UserCredentials table:', error);
    }
  }
};

module.exports = {
  createUserCredentialsTable
};
