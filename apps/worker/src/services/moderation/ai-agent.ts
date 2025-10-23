import {
  IModerationEngine,
  ModerationRule,
  ModerationResult,
} from './engine'

/**
 * AI Agent 모더레이션 엔진 (OpenAI 기반)
 * 
 * TODO: 나중에 구현
 * - OpenAI API 연동
 * - 컨텍스트 기반 분석
 * - 의도 파악
 * - 감정 분석
 * - 문화적 뉘앙스 이해
 */
export class AIAgentEngine implements IModerationEngine {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = 'gpt-4') {
    this.apiKey = apiKey
    this.model = model
  }

  getName(): string {
    return 'AI Agent Engine (OpenAI)'
  }

  async analyze(
    text: string,
    platform: 'youtube' | 'instagram',
    rules: ModerationRule[]
  ): Promise<ModerationResult> {
    // TODO: OpenAI API 호출
    // 
    // 예상 프롬프트:
    // """
    // 다음 댓글을 분석해주세요:
    // "{text}"
    //
    // 플랫폼: {platform}
    //
    // 다음 규칙들을 고려하세요:
    // {rules.map(r => `- ${r.name}: ${r.pattern}`).join('\n')}
    //
    // 다음을 JSON 형식으로 응답하세요:
    // {
    //   "shouldModerate": boolean,
    //   "matchedRules": [...],
    //   "suggestedAction": "hide" | "delete" | "reply" | null,
    //   "reason": "상세 설명",
    //   "confidence": 0.0 ~ 1.0
    // }
    // """

    console.log('[AI Agent] Not implemented yet. Using fallback.')

    // 임시: 규칙 기반으로 폴백
    const { RuleBasedEngine } = await import('./rule-based')
    const fallback = new RuleBasedEngine()
    return fallback.analyze(text, platform, rules)
  }

  /**
   * OpenAI API 호출 (미구현)
   */
  private async callOpenAI(prompt: string): Promise<any> {
    // TODO: OpenAI SDK 사용
    throw new Error('Not implemented')
  }
}
