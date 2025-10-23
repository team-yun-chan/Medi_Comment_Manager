/**
 * 모더레이션 엔진 인터페이스
 * 
 * 이 인터페이스를 구현하면 규칙 기반, AI 기반 등
 * 다양한 모더레이션 전략을 교체할 수 있습니다.
 */

export interface ModerationRule {
  id: string
  name: string
  platform: 'youtube' | 'instagram' | 'all'
  type: 'keyword' | 'regex' | 'user' | 'spam'
  pattern: string
  action: 'hide' | 'delete' | 'reply'
  enabled: boolean
}

export interface ModerationResult {
  shouldModerate: boolean
  matchedRules: Array<{
    ruleId: string
    ruleName: string
    action: string
    confidence?: number // AI 모드에서 사용
    reason?: string     // AI 모드에서 사용
  }>
  suggestedAction?: 'hide' | 'delete' | 'reply'
  aiAnalysis?: string // AI 모드에서 추가 설명
}

export interface IModerationEngine {
  /**
   * 댓글 분석
   */
  analyze(
    text: string,
    platform: 'youtube' | 'instagram',
    rules: ModerationRule[]
  ): Promise<ModerationResult>

  /**
   * 엔진 이름
   */
  getName(): string
}
