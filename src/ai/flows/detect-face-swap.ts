
'use server';
/**
 * @fileOverview Detects potential face swaps in an image.
 *
 * - detectFaceSwap - A function that analyzes an image for face swaps.
 * - DetectFaceSwapInput - The input type for the detectFaceSwap function.
 * - DetectFaceSwapOutput - The return type for the detectFaceSwap function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DetectFaceSwapInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze for face swaps, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'." // prettier-ignore
    ),
});
export type DetectFaceSwapInput = z.infer<typeof DetectFaceSwapInputSchema>;

const DetectFaceSwapOutputSchema = z.object({
  isFaceSwapDetected: z
    .boolean()
    .describe('Whether a face swap is likely detected in the image.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence score (0-1) indicating the likelihood of a face swap.'),
  reasoning: z
    .string()
    .describe('Explanation of the detection result, highlighting potential inconsistencies or artifacts.'),
});
export type DetectFaceSwapOutput = z.infer<typeof DetectFaceSwapOutputSchema>;

export async function detectFaceSwap(input: DetectFaceSwapInput): Promise<DetectFaceSwapOutput> {
  return detectFaceSwapFlow(input);
}

const detectFaceSwapPrompt = ai.definePrompt({
  name: 'detectFaceSwapPrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo to analyze for face swaps, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'." // prettier-ignore
        ),
    }),
  },
  output: {
    schema: z.object({
      isFaceSwapDetected: z
        .boolean()
        .describe('Whether a face swap is likely detected in the image.'),
      confidenceScore: z
        .number()
        .min(0)
        .max(1)
        .describe('The confidence score (0-1) indicating the likelihood of a face swap.'),
      reasoning: z
        .string()
        .describe('Explanation of the detection result, highlighting potential inconsistencies (like lighting, edges, skin tone) or artifacts.'),
    }),
  },
  prompt: `You are an expert in detecting digital image manipulations, specifically face swaps. Analyze the provided image for signs of a face swap. Consider factors like:
- Mismatched lighting or shadows between the face and the body/background.
- Unnatural edges or seams around the face or neck area.
- Inconsistent skin tones or textures.
- Blurriness or artifacts specific to the facial region compared to the rest of the image.
- Unnatural facial proportions or alignment.

Based on your analysis, determine if a face swap is likely present, provide a confidence score between 0 and 1, and explain your reasoning.

Image: {{media url=photoDataUri}}`,
});

const detectFaceSwapFlow = ai.defineFlow<
  typeof DetectFaceSwapInputSchema,
  typeof DetectFaceSwapOutputSchema
>({
  name: 'detectFaceSwapFlow',
  inputSchema: DetectFaceSwapInputSchema,
  outputSchema: DetectFaceSwapOutputSchema,
}, async input => {
  const {output} = await detectFaceSwapPrompt(input);
  // Basic validation/fallback
  if (!output) {
      throw new Error("Face swap detection failed to produce an output.");
  }
  // Ensure score is within bounds, simple clamp
  output.confidenceScore = Math.max(0, Math.min(1, output.confidenceScore));

  return output;
});

