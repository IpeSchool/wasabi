import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const filename = body.filename;

    if (!filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Filename kerak" }),
      };
    }

    const s3 = new S3Client({
      region: "Osaka ap-northeast-2",
      endpoint: "https://s3.wasabisys.com",
      credentials: {
        accessKeyId: process.env.WASABI_KEY,
        secretAccessKey: process.env.WASABI_SECRET,
      },
    });

    const command = new PutObjectCommand({
      Bucket: "dbtest",
      Key: filename,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return {
      statusCode: 200,
      body: JSON.stringify({ url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
