// netlify/functions/get-wasabi-token.js
const AWS = require('aws-sdk');

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { filename } = JSON.parse(event.body);
    
    if (!filename) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Filename required' })
      };
    }

    // AWS SDK ni sozlash
    const s3 = new AWS.S3({
      accessKeyId: process.env.WASABI_KEY,
      secretAccessKey: process.env.WASABI_SECRET,
      region: 'ap-northeast-2',
      endpoint: 'https://s3.ap-northeast-2.wasabisys.com',
      s3ForcePathStyle: true
    });

    // Signed URL yaratish
    const params = {
      Bucket: 'dbtest',
      Key: filename,
      Expires: 3600, // 1 soat
      ContentType: 'application/octet-stream'
    };

    const signedUrl = s3.getSignedUrl('putObject', params);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        signedUrl,
        filename 
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
