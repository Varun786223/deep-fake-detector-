
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeDeepfake } from '@/ai/flows/analyze-deepfake';
import { detectFaceSwap } from '@/ai/flows/detect-face-swap';
import { analyzeDeepfakeVideo } from '@/ai/flows/analyze-deepfake-video';

// Define input schema for the API endpoint
const ApiInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "An image or video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'." // prettier-ignore
    ),
  analysisType: z.enum(['deepfake', 'faceswap', 'video']), // Specify which analysis to run
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = ApiInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input format.', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { mediaDataUri, analysisType } = validationResult.data;

    // Basic MIME type check
    const mimeTypeMatch = mediaDataUri.match(/^data:(.+);base64,/);
    if (!mimeTypeMatch) {
        return NextResponse.json(
            { error: 'Invalid data URI format. Missing MIME type.' },
            { status: 400 }
        );
    }
    const mimeType = mimeTypeMatch[1];
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    let result;

    switch (analysisType) {
      case 'deepfake':
        if (!isImage) {
             return NextResponse.json({ error: 'Invalid media type for deepfake analysis. Expected image.' }, { status: 400 });
        }
        result = await analyzeDeepfake({ photoDataUri: mediaDataUri });
        break;
      case 'faceswap':
         if (!isImage) {
             return NextResponse.json({ error: 'Invalid media type for face swap analysis. Expected image.' }, { status: 400 });
        }
        result = await detectFaceSwap({ photoDataUri: mediaDataUri });
        break;
      case 'video':
         if (!isVideo) {
             return NextResponse.json({ error: 'Invalid media type for video analysis. Expected video.' }, { status: 400 });
        }
        result = await analyzeDeepfakeVideo({ videoDataUri: mediaDataUri });
        break;
      default:
        // Should not happen due to Zod validation, but include for safety
        return NextResponse.json({ error: 'Invalid analysis type specified.' }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('API Analysis Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json(
      { error: 'Failed to process the analysis request.', details: errorMessage },
      { status: 500 }
    );
  }
}
