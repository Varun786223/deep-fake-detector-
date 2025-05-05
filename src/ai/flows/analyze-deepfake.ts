'use server';
/**
 * @fileOverview Analyzes an image to determine the likelihood of it being a deepfake.
 *
 * - analyzeDeepfake - A function that analyzes the deepfake image.
 * - AnalyzeDeepfakeInput - The input type for the analyzeDeepfake function.
 * - AnalyzeDeepfakeOutput - The return type for the analyzeDeepfake function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeDeepfakeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type AnalyzeDeepfakeInput = z.infer<typeof AnalyzeDeepfakeInputSchema>;

const AnalyzeDeepfakeOutputSchema = z.object({
  confidenceScore: z
    .number()
    .describe('The confidence score (0-1) indicating the likelihood of the image being a deepfake.'),
  analysisReport: z
    .string()
    .describe('The analysis report of the deepfake detection, which may include details about manipulated areas.'),
});
export type AnalyzeDeepfakeOutput = z.infer<typeof AnalyzeDeepfakeOutputSchema>;

export async function analyzeDeepfake(input: AnalyzeDeepfakeInput): Promise<AnalyzeDeepfakeOutput> {
  return analyzeDeepfakeFlow(input);
}

const analyzeDeepfakePrompt = ai.definePrompt({
  name: 'analyzeDeepfakePrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          'A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
        ),
    }),
  },
  output: {
    schema: z.object({
      confidenceScore: z
        .number()
        .describe('The confidence score (0-1) indicating the likelihood of the image being a deepfake.'),
      analysisReport: z
        .string()
        .describe('The analysis report of the deepfake detection, which may include details about manipulated areas.'),
    }),
  },
  prompt: `You are an expert in deepfake detection. Analyze the image and provide a confidence score (0-1) indicating the likelihood of the image being a deepfake. Also, provide an analysis report of the deepfake detection, which may include details about manipulated areas. Photo: {{media url=photoDataUri}}`,
});

const analyzeDeepfakeFlow = ai.defineFlow<
  typeof AnalyzeDeepfakeInputSchema,
  typeof AnalyzeDeepfakeOutputSchema
>({
  name: 'analyzeDeepfakeFlow',
  inputSchema: AnalyzeDeepfakeInputSchema,
  outputSchema: AnalyzeDeepfakeOutputSchema,
}, async input => {
  const {output} = await analyzeDeepfakePrompt(input);
  return output!;
});
