'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Play, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { moderationApi } from '@/lib/api'

export default function ModerationPage() {
  const [rules, setRules] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [testText, setTestText] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    platform: 'all',
    type: 'keyword',
    pattern: '',
    action: 'hide',
  })

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const { data } = await moderationApi.getRules()
      setRules(data.rules)
    } catch (error) {
      console.error('Failed to load rules:', error)
    }
  }

  const createRule = async () => {
    try {
      await moderationApi.createRule(formData)
      setShowCreateForm(false)
      setFormData({
        name: '',
        platform: 'all',
        type: 'keyword',
        pattern: '',
        action: 'hide',
      })
      loadRules()
    } catch (error) {
      console.error('Failed to create rule:', error)
      alert('규칙 생성에 실패했습니다')
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm('이 규칙을 삭제하시겠습니까?')) return

    try {
      await moderationApi.deleteRule(ruleId)
      setRules(rules.filter((r) => r.id !== ruleId))
    } catch (error) {
      console.error('Failed to delete rule:', error)
      alert('규칙 삭제에 실패했습니다')
    }
  }

  const testRule = async () => {
    if (!testText.trim()) {
      alert('테스트할 텍스트를 입력하세요')
      return
    }

    try {
      const { data } = await moderationApi.simulate(testText)
      setTestResult(data)
    } catch (error) {
      console.error('Failed to test rule:', error)
      alert('테스트에 실패했습니다')
    }
  }

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Badge variant="destructive">YouTube</Badge>
      case 'instagram':
        return <Badge variant="secondary">Instagram</Badge>
      case 'all':
        return <Badge>전체</Badge>
      default:
        return <Badge variant="outline">{platform}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      keyword: '키워드',
      regex: '정규식',
      user: '사용자',
      spam: '스팸',
    }
    return <Badge variant="outline">{labels[type] || type}</Badge>
  }

  const getActionBadge = (action: string) => {
    const labels: Record<string, string> = {
      hide: '숨김',
      delete: '삭제',
      reply: '답글',
    }
    return <Badge variant="outline">{labels[action] || action}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">자동 관리</h1>
          <p className="text-muted-foreground">
            규칙 기반으로 댓글을 자동으로 관리하세요
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          규칙 추가
        </Button>
      </div>

      {/* 규칙 생성 폼 */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>새 규칙 만들기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">규칙 이름</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 욕설 필터"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">플랫폼</label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="all">전체</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">타입</label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="keyword">키워드</option>
                  <option value="regex">정규식</option>
                  <option value="spam">스팸</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">액션</label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                >
                  <option value="hide">숨김</option>
                  <option value="delete">삭제</option>
                  <option value="reply">답글</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">패턴</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                placeholder="예: 욕설단어"
              />
              <p className="text-xs text-muted-foreground mt-1">
                키워드는 부분 일치, 정규식은 패턴 매칭
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={createRule}>생성</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 규칙 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>규칙 테스트</CardTitle>
          <CardDescription>
            댓글 텍스트를 입력하여 어떤 규칙이 적용되는지 미리 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-md"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="테스트할 댓글 텍스트 입력..."
            />
            <Button onClick={testRule}>
              <Play className="mr-2 h-4 w-4" />
              테스트
            </Button>
          </div>

          {testResult && (
            <div className="p-4 border rounded-lg">
              {testResult.wouldTrigger ? (
                <div className="space-y-2">
                  <p className="font-medium text-destructive">
                    ⚠️ {testResult.matches.length}개 규칙이 작동됩니다
                  </p>
                  {testResult.matches.map((match: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge>{match.ruleName}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline">{match.action}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">✅ 작동하는 규칙이 없습니다</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 규칙 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>활성 규칙</CardTitle>
          <CardDescription>{rules.length}개 규칙</CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>등록된 규칙이 없습니다</p>
              <p className="text-sm">위의 "규칙 추가" 버튼을 눌러 새 규칙을 만드세요</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>규칙명</TableHead>
                  <TableHead>플랫폼</TableHead>
                  <TableHead>타입</TableHead>
                  <TableHead>패턴</TableHead>
                  <TableHead>액션</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{getPlatformBadge(rule.platform)}</TableCell>
                    <TableCell>{getTypeBadge(rule.type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{rule.pattern}</TableCell>
                    <TableCell>{getActionBadge(rule.action)}</TableCell>
                    <TableCell>
                      {rule.enabled ? (
                        <Badge variant="default">활성</Badge>
                      ) : (
                        <Badge variant="secondary">비활성</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
