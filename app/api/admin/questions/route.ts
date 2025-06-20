import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { lookup } from "mime-types"; // For guessing content type
import { Buffer } from "buffer";

export async function GET() {
  await connectDB();
  const questions = await Question.find().sort({ createdAt: -1 });
  return NextResponse.json(questions);
}

const uploadImage = async (
  base64String: string | null
): Promise<string | null> => {
  if (!base64String) {
    return null;
  }
  const base64Data = base64String.split(";base64,").pop();
  if (!base64Data) {
    console.error("Invalid base64 string format");
    return null;
  }

  try {
    const buffer = Buffer.from(base64Data, "base64");

    // Try to guess the content type from the base64 data URL prefix
    let contentType: string | false = false;
    if (base64String.startsWith("data:image/")) {
      contentType = base64String.substring(
        "data:image/".length,
        base64String.indexOf(";base64")
      );
    }

    // Generate a unique filename with a guessed extension (default to png)
    let fileExtension = "png";
    if (contentType) {
      const guessedExtension = lookup(contentType);
      if (guessedExtension) {
        fileExtension = guessedExtension;
      }
    }
    const filename = `logos/${uuidv4()}.${fileExtension}`;

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: filename,
        Body: buffer,
        ContentType: contentType || "image/png", // Default to png if not guessed
      })
    );

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("Error uploading base64 image to S3:", error);
    return null;
  }
};

export async function POST(req: Request) {
  await connectDB();

  try {
    const { text, image: imageBase64, options: optionsData } = await req.json();

    let imageUrl = "";
    if (imageBase64) {
      imageUrl = (await uploadImage(imageBase64)) || "";
    }

    let processedOptions = [];
    console.log(optionsData);
    if (optionsData) {
      try {
        if (!Array.isArray(optionsData)) {
          return NextResponse.json(
            { error: "Invalid options format" },
            { status: 400 }
          );
        }
        processedOptions = await Promise.all(
          optionsData.map(async (option) => {
            const newOption = { ...option };
            if (option.image) {
              console.log(option.image);
              newOption.image = (await uploadImage(option.image)) || "";
            } else {
              newOption.image = "";
            }
            return newOption;
          })
        );
      } catch (error: any) {
        return NextResponse.json(
          { error: "Error processing options: " + error.message },
          { status: 400 }
        );
      }
    }

    const newQuestionData = {
      text: text || "",
      image: imageUrl,
      options: processedOptions,
    };

    console.log("Structured Data:", newQuestionData);

    const question = await Question.create(newQuestionData);
    return NextResponse.json(question, { status: 201 });
  } catch (error: any) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await connectDB();
  const deletedQuestion = await Question.findByIdAndDelete(id);
  if (!deletedQuestion) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Question deleted successfully" });
}
