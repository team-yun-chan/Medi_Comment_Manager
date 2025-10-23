import {
  IModerationEngine,
  ModerationRule,
  ModerationResult,
} from './engine'

/**
 * 규칙 기반 모더레이션 엔진
 * 
 * 키워드, 정규식, 스팸 패턴을 사용한 단순 필터링
 */
export class RuleBasedEngine implements IModerationEngine {
  getName(): string {
    return 'Rule-Based Engine'
  }

  async analyze(
    text: string,
    platform: 'youtube' | 'instagram',
    rules: ModerationRule[]
  ): Promise<ModerationResult> {
    const matchedRules: ModerationResult['matchedRules'] = []

    // 플랫폼 필터링
    const applicableRules = rules.filter(
      (rule) => rule.enabled && (rule.platform === platform || rule.platform === 'all')
    )

    for (const rule of applicableRules) {
      const isMatch = await this.checkRule(text, rule)

      if (isMatch) {
        matchedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          action: rule.action,
          confidence: 1.0, // 규칙 기반은 100% 확신
        })
      }
    }

    // 우선순위: delete > hide > reply
    const suggestedAction = this.getSuggestedAction(matchedRules)

    return {
      shouldModerate: matchedRules.length > 0,
      matchedRules,
      suggestedAction,
    }
  }

  /**
   * 규칙 체크
   */
  private async checkRule(text: string, rule: ModerationRule): Promise<boolean> {
    switch (rule.type) {
      case 'keyword':
        return this.checkKeyword(text, rule.pattern)

      case 'regex':
        return this.checkRegex(text, rule.pattern)

      case 'spam':
        return this.checkSpam(text)

      case 'user':
        // 사용자 기반 필터링은 댓글 작성자 정보 필요
        // 현재는 스킵
        return false

      default:
        return false
    }
  }

  /**
   * 키워드 매칭 (대소문자 무시)
   */
  private checkKeyword(text: string, pattern: string): boolean {
    const keywords = pattern.split(',').map((k) => k.trim().toLowerCase())
    const lowerText = text.toLowerCase()

    return keywords.some((keyword) => lowerText.includes(keyword))
  }

  /**
   * 정규식 매칭
   */
  private checkRegex(text: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern, 'i')
      return regex.test(text)
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error)
      return false
    }
  }

  /**
   * 스팸 감지
   */
  private checkSpam(text: string): boolean {
    // 1. URL 포함 여부
    const hasUrl = /https?:\/\/|www\./i.test(text)

    // 2. 반복 문자 (5개 이상)
    const hasRepeatedChars = /(.)\1{5,}/.test(text)

    // 3. 과도한 대문자 (70% 이상)
    const upperCount = (text.match(/[A-Z]/g) || []).length
    const hasExcessiveCaps = upperCount > text.length * 0.7

    // 4. 과도한 이모지
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu) || []).length
    const hasExcessiveEmojis = emojiCount > 10

    // 5. 짧은 텍스트 + URL
    const isShortWithUrl = text.length < 20 && hasUrl

    return hasUrl || hasRepeatedChars || hasExcessiveCaps || hasExcessiveEmojis || isShortWithUrl
  }

  /**
   * 제안 액션 선택 (우선순위 기반)
   */
  private getSuggestedAction(
    matchedRules: ModerationResult['matchedRules']
  ): 'hide' | 'delete' | 'reply' | undefined {
    if (matchedRules.length === 0) return undefined

    // 우선순위: delete > hide > reply
    if (matchedRules.some((r) => r.action === 'delete')) return 'delete'
    if (matchedRules.some((r) => r.action === 'hide')) return 'hide'
    if (matchedRules.some((r) => r.action === 'reply')) return 'reply'

    return matchedRules[0].action as any
  }
}
