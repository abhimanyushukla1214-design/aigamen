import { generateStructuredJson } from '../services/geminiService.js';
import { discoveryIntentSchema, discoveryExplanationSchema } from '../services/geminiSchemas.js';
import { GameDiscoveryResponse, DiscoveredGame } from '../types/nexus.js';
import { GAME_DATABASE, GameRecord } from '../data/gameDatabase.js';

function calculateMatchScore(intent: any, game: GameRecord): number {
  let score = 0;
  
  // Genres match (High weight)
  const genresMatch = intent.extractedGenres?.filter((g: string) => 
    game.genres.some(gg => gg.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(gg.toLowerCase()))
  ).length || 0;
  score += genresMatch * 15;

  // Themes match (High weight)
  const themesMatch = intent.extractedThemes?.filter((t: string) => 
    game.themes.some(gt => gt.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(gt.toLowerCase()))
  ).length || 0;
  score += themesMatch * 12;

  // Mechanics match (Medium weight)
  const mechanicsMatch = intent.desiredMechanics?.filter((m: string) => 
    game.mechanics.some(gm => gm.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(gm.toLowerCase()))
  ).length || 0;
  score += mechanicsMatch * 10;
  
  // Keyword match in description (Low weight)
  const allKeywords = [...(intent.extractedGenres || []), ...(intent.extractedThemes || []), ...(intent.desiredMechanics || [])];
  const keywordMatches = allKeywords.filter((k: string) => game.description.toLowerCase().includes(k.toLowerCase())).length;
  score += keywordMatches * 2;

  return Math.min(100, Math.max(0, score + 10)); // Base score 10
}

export async function runDiscoveryPipeline(prompt: string, limit: number = 3): Promise<GameDiscoveryResponse> {
  // 1. Intent Extraction
  
  let intentResult;
  try {
    intentResult = await generateStructuredJson<any>({
      prompt: `Extract the discovery intent from this game idea: "${prompt}"`,
      systemInstruction: "You are the NEXUS Discovery Agent. Extract genres, themes, and mechanics from the prompt.",
      schema: discoveryIntentSchema
    });
  } catch(e) {
    const errStr = e instanceof Error ? e.message : String(e);
    if (errStr.includes('429') || errStr.includes('503') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand')) {
      console.log('Discovery intent rate limited. Using fallback.');
    } else {
      console.error('Discovery intent failed:', e);
    }
    intentResult = { data: { extractedGenres: [], extractedThemes: [], desiredMechanics: [], pacing: 'unspecified' } };
  }

  
  const intent = intentResult.data;

  // 2. Deterministic Ranking
  const scoredGames = GAME_DATABASE.map(game => ({
    game,
    score: calculateMatchScore(intent, game)
  })).sort((a, b) => b.score - a.score);

  const topMatches = scoredGames.slice(0, limit);

  // 3. Gemini Explanation
  const explanationPrompt = `
User Prompt: "${prompt}"
Top Matches:
${topMatches.map(m => `ID: ${m.game.id}, Title: ${m.game.title}, Desc: ${m.game.description}`).join('\
')}

Explain why these games match the user's idea and how they differ from the specific intent.`;

  
  let explanationResult;
  try {
    explanationResult = await generateStructuredJson<any>({
      prompt: explanationPrompt,
      systemInstruction: "You are the NEXUS Discovery Agent. Analyze how the given games relate to the user's game idea. For each game, provide a short matchReason and keyDifferences. Then provide an overall aiAnalysis.",
      schema: discoveryExplanationSchema
    });
  } catch(e) {
    const errStr = e instanceof Error ? e.message : String(e);
    if (errStr.includes('429') || errStr.includes('503') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand')) {
      console.log('Discovery explanation rate limited. Using fallback.');
    } else {
      console.error('Discovery explanation failed:', e);
    }
    explanationResult = { data: { games: [], aiAnalysis: "Fallback analysis due to API limit." } };
  }


  const explanationData = explanationResult.data;

  // Combine data
  const recommendedGames: DiscoveredGame[] = topMatches.map(match => {
    const aiExp = explanationData.games?.find((g: any) => g.id === match.game.id);
    return {
      id: match.game.id,
      title: match.game.title,
      developer: match.game.developer,
      releaseYear: match.game.releaseYear,
      platforms: match.game.platforms,
      genres: match.game.genres,
      description: match.game.description,
      matchScore: match.score,
      matchReason: aiExp?.matchReason || 'Matches the requested genre and themes.',
      keyDifferences: aiExp?.keyDifferences || 'Differs in specific mechanics or pacing.'
    };
  });

  return {
    queryIntent: {
      extractedGenres: intent.extractedGenres || [],
      extractedThemes: intent.extractedThemes || [],
      desiredMechanics: intent.desiredMechanics || [],
      pacing: intent.pacing || 'unspecified'
    },
    recommendedGames,
    aiAnalysis: explanationData.aiAnalysis || 'We found some games that share core elements with your idea.'
  };
}
