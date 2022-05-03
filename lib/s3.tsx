import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

interface putObject {
  key: string;
  body: string;
  contentType: string;
}

export const putObject = async ({ key, body, contentType }: putObject) => {
  if (
    !process.env.AWS_ACCESS_KEY_ID_MYAPP ||
    !process.env.AWS_SECRET_ACCESS_KEY_MYAPP
  )
    return;
  const s3 = new S3Client({
    region: process.env.AWS_REGION_MYAPP,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_MYAPP,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_MYAPP,
    },
  });

  // workaround for the issue: https://github.com/aws/aws-sdk-js-v3/issues/1800
  s3.middlewareStack.add(
    (next, context) => (args: any) => {
      delete args.request.headers["content-type"];
      return next(args);
    },
    {
      step: "build",
    }
  );

  const objectParams = {
    ACL: "public-read",
    Bucket: process.env.AWS_BUCKET_MYAPP,
    Key: key,
    Body: body,
    ContentType: contentType,
  };

  const results = await s3.send(new PutObjectCommand(objectParams));
  console.log(results);
  return results;
};

export const getAWS = () => {
  console.log([process.env.AWS_BUCKET_MYAPP, process.env.AWS_REGION_MYAPP]);
  return [process.env.AWS_BUCKET_MYAPP, process.env.AWS_REGION_MYAPP];
};
