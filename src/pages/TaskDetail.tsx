type TaskDetailProps = {
  onReviewEvidence: () => void;
  onGenerateEmail: () => void;
  onBackToDashboard: () => void;
};

const text = {
  header: '任务标题',
  summary: '问题摘要',
  evidence: 'AI 依据',
  why: '为什么创建此任务',
  whyIntro: '此任务由系统基于客户文档分析自动生成。',
  whyLine1: '预期月份：1月 – 6月',
  whyLine2: '已收到月份：1月 – 5月',
  whyLine3: '缺失：6月',
  whyLine4: '置信度：92%',
  whyNote: '数据来源于经 OCR 与分类流水线处理的邮件附件。',
  escalation: '可能升级',
  actions: '建议操作',
  missing: '缺少',
  impact: '影响',
  status: '状态',
  expected: '预期月份',
  received: '已收到月份',
  confidence: '置信度',
  review: '查看依据',
  email: '生成跟进邮件',
  back: '返回仪表盘',
  currentOwner: '当前负责人：Accountant',
  gst: 'GST 问题',
  clientDelay: '客户延迟',
} as const;

export function TaskDetail({ onReviewEvidence, onGenerateEmail, onBackToDashboard }: TaskDetailProps) {
  return (
    <div>
      <section className="card header-card">
        <div className="sidebar-label">{text.header}</div>
        <h1 className="page-title" style={{ fontSize: 28, marginTop: 8 }}>Missing June Supplier Invoice</h1>
        <p className="page-subtitle">Apex Retail Pte Ltd</p>
        <div className="btn-group" style={{ marginTop: 16 }}>
          <span className="badge badge-high">高优先级</span>
          <span className="badge badge-status">指派给 Accountant</span>
          <span className="badge badge-accountant">{text.currentOwner}</span>
        </div>
      </section>

      <section className="grid-2" style={{ marginBottom: 16 }}>
        <article className="card">
          <h2 className="card-title">{text.summary}</h2>
          <div className="list">
            <div className="row"><strong>{text.missing}</strong><span>June Supplier Invoice</span></div>
            <div className="row"><strong>{text.impact}</strong><span>月度记账无法完成</span></div>
            <div className="row"><strong>{text.status}</strong><span className="badge badge-status">打开中</span></div>
          </div>
        </article>

        <article className="card">
          <h2 className="card-title">{text.evidence}</h2>
          <div className="list">
            <div className="row"><strong>{text.expected}</strong><span>1月 – 6月</span></div>
            <div className="row"><strong>{text.received}</strong><span>1月 – 5月</span></div>
            <div className="row"><strong>{text.missing}</strong><span>6月</span></div>
            <div className="row"><strong>{text.confidence}</strong><span>92%</span></div>
          </div>
        </article>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 className="card-title">{text.escalation}</h2>
        <div className="list">
          <div className="row"><strong>{text.gst}</strong><span className="badge badge-cpa">→ CPA</span></div>
          <div className="row"><strong>{text.clientDelay}</strong><span className="badge badge-manager">→ 经理</span></div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 className="card-title">{text.actions}</h2>
        <div className="list">
          <div className="row">{text.review}</div>
          <div className="row">{text.email}</div>
        </div>
      </section>

      <section className="btn-group">
        <button type="button" onClick={onReviewEvidence} className="btn btn-primary">{text.review}</button>
        <button type="button" onClick={onGenerateEmail} className="btn btn-secondary">{text.email}</button>
        <button type="button" onClick={onBackToDashboard} className="btn btn-ghost">{text.back}</button>
      </section>
    </div>
  );
}
