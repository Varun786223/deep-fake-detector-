'use server';
/**
 * @fileOverview Deepfake video analysis flow.
 *
 * - analyzeDeepfakeVideo - Analyzes a video to detect deepfakes.
 * - AnalyzeDeepfakeVideoInput - Input type for analyzeDeepfakeVideo.
 * - AnalyzeDeepfakeVideoOutput - Output type for analyzeDeepfakeVideo.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeDeepfakeVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeDeepfakeVideoInput = z.infer<typeof AnalyzeDeepfakeVideoInputSchema>;

const AnalyzeDeepfakeVideoOutputSchema = z.object({
  confidenceScore: z
    .number()
    .describe(
      'A score between 0 and 1 indicating the likelihood of the video containing a deepfake, with 1 being most likely.'
    ),
  explanation: z.string().describe('Explanation of why the model made the prediction.'),
});
export type AnalyzeDeepfakeVideoOutput = z.infer<typeof AnalyzeDeepfakeVideoOutputSchema>;

export async function analyzeDeepfakeVideo(
  input: AnalyzeDeepfakeVideoInput
): Promise<AnalyzeDeepfakeVideoOutput> {
  return analyzeDeepfakeVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDeepfakeVideoPrompt',
  input: {
    schema: z.object({
      videoDataUri: z
        .string()
        .describe(
          "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      confidenceScore: z
        .number()
        .describe(
          'A score between 0 and 1 indicating the likelihood of the video containing a deepfake, with 1 being most likely.'
        ),
      explanation: z.string().describe('Explanation of why the model made the prediction.'),
    }),
  },
  prompt: `You are an AI deepfake detection expert. Analyze the given video and provide a confidence score between 0 and 1, where 1 indicates a high likelihood of being a deepfake. Also provide an explanation for your assessment.

Video: {{media url=videoDataUri}}`,
});

const analyzeDeepfakeVideoFlow = ai.defineFlow<
  typeof AnalyzeDeepfakeVideoInputSchema,
  typeof AnalyzeDeepfakeVideoOutputSchema
>(
  {
    name: 'analyzeDeepfakeVideoFlow',
    inputSchema: AnalyzeDeepfakeVideoInputSchema,
    outputSchema: AnalyzeDeepfakeVideoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
