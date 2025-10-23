import { IModerationEngine } from './engine'
import { RuleBasedEngine } from './rule-based'
import { AIAgentEngine } from './ai-agent'
import { config } from '../../config'

/**
 * 모더레이션 엔진 팩토리
 * 
 * 환경변수 또는 설정에 따라 엔진을 선택합니다.
 * 나중에 OpenAI Agent로 교체하려면:
 * 1. .env에 OPENAI_API_KEY 추가
 * 2. MODERATION_ENGINE=ai 설정
 * 3. ai-agent.ts 구현 완료
 */

export type EngineType = 'rule-based' | 'ai-agent'

export class ModerationEngineFactory {
  private static instance: IModerationEngine | null = null

  /**
   * 엔진 가져오기 (싱글톤)
   */
  static getEngine(type?: EngineType): IModerationEngine {
    if (this.instance) {
      return this.instance
    }

    const engineType = type || this.detectEngineType()

    switch (engineType) {
      case 'ai-agent':
        if (!config.moderation.openaiApiKey) {
          console.warn('⚠️  OpenAI API Key not found. Falling back to Rule-Based Engine.')
          this.instance = new RuleBasedEngine()
        } else {
          console.log('🤖 Using AI Agent Engine')
          this.instance = new AIAgentEngine(
            config.moderation.openaiApiKey,
            config.moderation.model
          )
        }
        break

      case 'rule-based':
      default:
        console.log('📋 Using Rule-Based Engine')
        this.instance = new RuleBasedEngine()
        break
    }

    return this.instance
  }

  /**
   * 엔진 타입 자동 감지
   */
  private static detectEngineType(): EngineType {
    // 환경변수로 선택
    const envEngine = process.env.MODERATION_ENGINE

    if (envEngine === 'ai-agent' || envEngine === 'ai') {
      return 'ai-agent'
    }

    // OpenAI 키가 있으면 AI 사용
    if (config.moderation.openaiApiKey) {
      return 'ai-agent'
    }

    // 기본: 규칙 기반
    return 'rule-based'
  }

  /**
   * 엔진 교체 (테스트용)
   */
  static setEngine(engine: IModerationEngine) {
    this.instance = engine
  }

  /**
   * 엔진 리셋
   */
  static reset() {
    this.instance = null
  }
}

// Export 편의성
export const getModerationEngine = () => ModerationEngineFactory.getEngine()
