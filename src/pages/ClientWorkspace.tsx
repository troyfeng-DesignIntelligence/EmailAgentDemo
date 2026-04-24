type ClientWorkspaceProps = {
  onGenerateEmail: () => void;
  onBackToTask: () => void;
};

const text = {
  header: '客户标题',
  coverage: '文档覆盖率',
  evidence: '依据面板',
  timeline: '邮件时间线',
  trace: '来源与处理轨迹',
  recommendation: 'AI 建议',
  generate: '生成跟进邮件',
  back: '返回任务',
} as const;

const traceSteps = [
  { icon: '✉️', title: '收到客户邮件', desc: '客户邮件进入工作流。', status: '完成' },
  { icon: '📎', title: '解析附件', desc: '系统已提取邮件附件。', status: '完成' },
  { icon: 'AI', title: '文件 OCR 识别', desc: '对附件执行 OCR 处理。', status: '完成' },
  { icon: '📄', title: '文档分类', desc: '按发票、银行对账单等类型分类。', status: '完成' },
  { icon: '🔍', title: '完整性检查', desc: '对文档集合执行覆盖率检查。', status: '完成' },
  { icon: '⚠️', title: '检测到缺少 6 月供应商发票', desc: '系统识别到缺失证据。', status: '完成' },
  { icon: '✅', title: '已创建任务', desc: '已生成后续跟进任务供审阅。', status: '已发现' },
] as const;

export function ClientWorkspace({ onGenerateEmail, onBackToTask }: ClientWorkspaceProps) {
  const receivedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const missingMonths = ['Jun'];

  return (
    <div>
      <section className="card header-card">
        <div className="sidebar-label">{text.header}</div>
        <h1 className="page-title" style={{ fontSize: 28 }}>Apex Retail Pte Ltd</h1>
        <p className="page-subtitle">月度记账 · 经理：杨文 · 风险：高</p>
      </section>

      <section className="grid-2" style={{ marginBottom: 16 }}>
        <article className="card">
          <h2 className="card-title">{text.coverage}</h2>
          <div className="kpi">83%</div>
          <div className="card-subtle">预期 vs 已收到</div>
          <div className="list" style={{ marginTop: 16 }}>
            <div className="row">预期：1月 · 2月 · 3月 · 4月 · 5月 · 6月</div>
            <div className="row">已收到：1月 · 2月 · 3月 · 4月 · 5月</div>
            <div className="row"><span className="badge badge-high">缺少：6月</span></div>
          </div>
        </article>

        <article className="card">
          <h2 className="card-title">{text.evidence}</h2>
          <div className="list">
            {receivedMonths.map((month) => <div key={month} className="row" style={{ background: '#ecfdf5' }}>{month} 已收到</div>)}
            {missingMonths.map((month) => <div key={month} className="row" style={{ background: '#fef2f2' }}>{month} 缺失</div>)}
          </div>
        </article>
      </section>

      <section className="grid-2" style={{ marginBottom: 16 }}>
        <article className="card">
          <h2 className="card-title">{text.timeline}</h2>
          <div className="list">
            <div className="row"><strong>客户最新邮件</strong><span className="card-subtle">客户发送了最新资料，但未附上 6 月发票。</span></div>
            <div className="row"><strong>之前跟进</strong><span className="card-subtle">已发送提醒，要求补交 6 月供应商发票。</span></div>
            <div className="row"><strong>历史中未找到 6 月发票</strong><span className="card-subtle">文档历史中没有 6 月供应商发票。</span></div>
          </div>
        </article>

        <article className="card">
          <h2 className="card-title">{text.trace}</h2>
          <div className="trace-list">
            {traceSteps.map((step, index) => (
              <div key={step.title} className="trace-item">
                <div className="trace-icon">{step.icon}</div>
                <div className="trace-content">
                  <div className="row-flex">
                    <strong>{step.title}</strong>
                    <span className={`badge ${step.status === '完成' ? 'badge-low' : 'badge-status'}`}>{step.status}</span>
                  </div>
                  <div className="card-subtle" style={{ marginTop: 4 }}>{step.desc}</div>
                </div>
                {index < traceSteps.length - 1 && <div className="trace-line" />}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 className="card-title">{text.recommendation}</h2>
        <div className="row row-primary">发送 L1 跟进邮件，索要缺少的 6 月供应商发票。</div>
      </section>

      <section className="btn-group">
        <button type="button" onClick={onGenerateEmail} className="btn btn-primary">{text.generate}</button>
        <button type="button" onClick={onBackToTask} className="btn btn-ghost">{text.back}</button>
      </section>
    </div>
  );
}
