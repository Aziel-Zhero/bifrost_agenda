// @/app/actions.ts
'use server';

import { cancellationInsights, type CancellationInsightsInput } from '@/ai/flows/cancellation-insights';

export async function getCancellationInsights(input: CancellationInsightsInput) {
  try {
    const insights = await cancellationInsights(input);
    return { success: true, data: insights };
  } catch (error) {
    console.error('Error getting cancellation insights:', error);
    return { success: false, error: 'Falha ao obter insights. Tente novamente.' };
  }
}
