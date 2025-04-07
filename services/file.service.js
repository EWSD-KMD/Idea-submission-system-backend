import fs from "fs";
import fsPromises from "fs/promises";
import stream from "node:stream";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

class FileService {
  #s3;

  constructor() {
    // Initialize AWS S3 Configurations
    const accessKeyId = process.env.ACCESS_KEY_ID;
    const secretAccessKey = process.env.SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("Missing AWS credentials");
    }

    // this.#s3 = new AWS.S3({
    //   forcePathStyle: true,
    //   region: process.env.AWS_REGION,
    //   endpoint: process.env.SUPABASE_S3_URL,
    //   credentials: {
    //     accessKeyId,
    //     secretAccessKey,
    //   },
    // });

    this.#s3 = new S3Client({
      forcePathStyle: true,
      region: process.env.AWS_REGION,
      endpoint: process.env.SUPABASE_S3_URL,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    sourceFilePath,
    destFilePath,
    contentType,
    fileId,
    fileName
  ) {
    const fileContentBuffer = fs.readFileSync(sourceFilePath);

    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      throw new Error("Missing S3 bucket name");
    }

    const params = {
      Bucket: bucketName,
      Key: destFilePath,
      Body: fileContentBuffer,
      ContentType: contentType || "application/octet-stream",
    };

    const result = await this.#s3.send(new PutObjectCommand(params));
    console.log("Upload successful:", result);
    fs.unlink(sourceFilePath, (err) => {
      if (err) console.error(err);
    });
    return { fileId, fileName };
  }

  async getFile(key) {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    });

    const response = await this.#s3.send(command);
    return response;
  }
}

export const fileService = new FileService();
