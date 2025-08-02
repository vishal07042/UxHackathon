// Gemini AI API Service for Journey Tips and Suggestions

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface JourneyTip {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'efficiency' | 'comfort' | 'cost' | 'general';
  transportMode: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface JourneyContext {
  origin: string;
  destination: string;
  transportModes: string[];
  preference: 'fastest' | 'cheapest' | 'comfortable';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: string;
  distance?: number;
  duration?: number;
}

class GeminiApiService {
  private async makeRequest(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found');
      return this.getFallbackTips();
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || this.getFallbackTips();
    } catch (error) {
      console.error('Gemini API request failed:', error);
      return this.getFallbackTips();
    }
  }

  private getFallbackTips(): string {
    return `Here are some general travel tips:
    
    🚌 **Bus Travel Tips:**
    - Check real-time schedules on your phone
    - Have exact change ready if paying cash
    - Move to the back of the bus to make room for others
    
    🚇 **Metro/Subway Tips:**
    - Stand to the right on escalators
    - Let passengers exit before boarding
    - Keep your ticket/card easily accessible
    
    🚶 **Walking Tips:**
    - Wear comfortable shoes for longer walks
    - Use pedestrian crossings and follow traffic signals
    - Stay aware of your surroundings
    
    💡 **General Tips:**
    - Plan for extra time during rush hours
    - Check for service disruptions before traveling
    - Consider alternative routes during peak times`;
  }

  async getJourneyTips(context: JourneyContext): Promise<JourneyTip[]> {
    const timeContext = this.getTimeContext();
    const weatherContext = context.weather ? `Current weather: ${context.weather}.` : '';
    
    const prompt = `As a travel expert, provide 5-7 practical tips for a journey from ${context.origin} to ${context.destination}. 

Journey Details:
- Transport modes: ${context.transportModes.join(', ')}
- Preference: ${context.preference}
- Time: ${context.timeOfDay} (${timeContext})
- Distance: ${context.distance ? `${context.distance}km` : 'unknown'}
- Duration: ${context.duration ? `${context.duration} minutes` : 'unknown'}
${weatherContext}

Please provide tips in this exact JSON format:
[
  {
    "id": "tip1",
    "title": "Short tip title",
    "description": "Detailed practical advice",
    "category": "safety|efficiency|comfort|cost|general",
    "transportMode": ["bus", "metro", "walk"],
    "priority": "high|medium|low"
  }
]

Focus on:
- Practical, actionable advice
- Mode-specific tips (bus etiquette, metro navigation, walking safety)
- Time-specific considerations (rush hour, night travel)
- Local insights and efficiency tips
- Safety and comfort recommendations

Return only valid JSON, no additional text.`;

    try {
      const response = await this.makeRequest(prompt);
      
      // Try to parse JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tips = JSON.parse(jsonMatch[0]);
        return tips.map((tip: any, index: number) => ({
          ...tip,
          id: tip.id || `tip-${index + 1}`
        }));
      }
      
      // Fallback to parsed text tips
      return this.parseTextToTips(response, context);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return this.parseTextToTips(this.getFallbackTips(), context);
    }
  }

  private parseTextToTips(text: string, context: JourneyContext): JourneyTip[] {
    const tips: JourneyTip[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentTip: Partial<JourneyTip> = {};
    let tipCounter = 1;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('**') && trimmed.includes('Tips:')) {
        // New category
        const mode = trimmed.toLowerCase();
        currentTip = {
          id: `tip-${tipCounter++}`,
          transportMode: this.extractTransportMode(mode),
          category: 'general',
          priority: 'medium'
        };
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        // Tip item
        const description = trimmed.replace(/^[-•]\s*/, '');
        if (description && currentTip.transportMode) {
          tips.push({
            id: `tip-${tipCounter++}`,
            title: this.generateTipTitle(description),
            description,
            category: this.categorizeDescription(description),
            transportMode: currentTip.transportMode,
            priority: this.prioritizeDescription(description)
          });
        }
      }
    }
    
    // If no tips parsed, create some generic ones
    if (tips.length === 0) {
      return this.createGenericTips(context);
    }
    
    return tips.slice(0, 7); // Limit to 7 tips
  }

  private extractTransportMode(text: string): string[] {
    const modes = [];
    if (text.includes('bus')) modes.push('bus');
    if (text.includes('metro') || text.includes('subway')) modes.push('metro');
    if (text.includes('walk')) modes.push('walk');
    if (text.includes('bike')) modes.push('bike');
    if (text.includes('tram')) modes.push('tram');
    return modes.length > 0 ? modes : ['general'];
  }

  private generateTipTitle(description: string): string {
    const words = description.split(' ').slice(0, 4);
    return words.join(' ') + (words.length < description.split(' ').length ? '...' : '');
  }

  private categorizeDescription(description: string): JourneyTip['category'] {
    const lower = description.toLowerCase();
    if (lower.includes('safe') || lower.includes('security') || lower.includes('aware')) return 'safety';
    if (lower.includes('time') || lower.includes('fast') || lower.includes('quick')) return 'efficiency';
    if (lower.includes('comfort') || lower.includes('seat') || lower.includes('relax')) return 'comfort';
    if (lower.includes('money') || lower.includes('cost') || lower.includes('cheap')) return 'cost';
    return 'general';
  }

  private prioritizeDescription(description: string): JourneyTip['priority'] {
    const lower = description.toLowerCase();
    if (lower.includes('important') || lower.includes('must') || lower.includes('safety')) return 'high';
    if (lower.includes('consider') || lower.includes('might') || lower.includes('could')) return 'low';
    return 'medium';
  }

  private createGenericTips(context: JourneyContext): JourneyTip[] {
    const tips: JourneyTip[] = [
      {
        id: 'generic-1',
        title: 'Plan ahead',
        description: 'Check schedules and plan your route in advance to avoid delays',
        category: 'efficiency',
        transportMode: context.transportModes,
        priority: 'high'
      },
      {
        id: 'generic-2',
        title: 'Stay alert',
        description: 'Keep your belongings secure and stay aware of your surroundings',
        category: 'safety',
        transportMode: context.transportModes,
        priority: 'high'
      },
      {
        id: 'generic-3',
        title: 'Have alternatives',
        description: 'Know backup routes in case of service disruptions',
        category: 'efficiency',
        transportMode: context.transportModes,
        priority: 'medium'
      }
    ];

    // Add mode-specific tips
    if (context.transportModes.includes('bus')) {
      tips.push({
        id: 'bus-tip',
        title: 'Bus etiquette',
        description: 'Move to the back of the bus and have your payment ready',
        category: 'general',
        transportMode: ['bus'],
        priority: 'medium'
      });
    }

    if (context.transportModes.includes('metro')) {
      tips.push({
        id: 'metro-tip',
        title: 'Metro navigation',
        description: 'Let passengers exit before boarding and stand right on escalators',
        category: 'general',
        transportMode: ['metro'],
        priority: 'medium'
      });
    }

    return tips;
  }

  private getTimeContext(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return 'morning rush hour';
    if (hour >= 10 && hour < 16) return 'off-peak hours';
    if (hour >= 16 && hour < 19) return 'evening rush hour';
    if (hour >= 19 && hour < 22) return 'evening';
    return 'night time';
  }

  async getLocationTips(location: string): Promise<string[]> {
    const prompt = `Provide 3-5 brief travel tips for visiting or traveling around ${location}. Focus on:
    - Local transport insights
    - Navigation tips
    - Cultural considerations
    - Safety advice
    
    Format as a simple list, one tip per line starting with "- ".`;

    try {
      const response = await this.makeRequest(prompt);
      return response
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim())
        .slice(0, 5);
    } catch (error) {
      return [
        'Research local transport options before traveling',
        'Keep important documents and emergency contacts handy',
        'Respect local customs and transportation etiquette'
      ];
    }
  }

  async getJourneyGuidance(journeyDetails: string): Promise<string[]> {
    const prompt = `${journeyDetails}

Provide step-by-step guidance as a travel assistant. Format as numbered steps:
1. Pre-journey preparation
2. Navigation instructions
3. Timing considerations
4. Potential issues to watch for
5. Arrival guidance

Keep each step concise and actionable.`;

    try {
      const response = await this.makeRequest(prompt);
      return response
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 8);
    } catch (error) {
      return [
        'Check your route and departure times before leaving',
        'Arrive at your first transport point 5-10 minutes early',
        'Keep your tickets and payment methods easily accessible',
        'Monitor real-time updates for any service disruptions',
        'Have backup route options in case of delays',
        'Stay alert and aware of your surroundings during travel',
        'Allow extra time for connections between different transport modes',
        'Confirm your final destination and nearby landmarks'
      ];
    }
  }
}

export const geminiApi = new GeminiApiService();