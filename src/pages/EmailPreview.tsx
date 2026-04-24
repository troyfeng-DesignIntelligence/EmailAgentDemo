type EmailPreviewProps = {
  subject: string;
  to: string;
  cc: string;
  followUpLevel: 'L1' | 'L2' | 'L3';
  body: string;
  missingDocument: string;
  clientName: string;
  coverage: number;
  confidence: number;
  demoStatus: 'EMAIL_READY' | 'WAITING_FOR_CLIENT' | 'COMPLETED' | 'OPEN_TASK' | 'REVIEWING';
  taskStatus: 'Open' | 'Waiting' | 'Completed' | 'In Progress';
  onBodyChange: (value: string) => void;
  onApproveSend: () => void;
  onSaveDraft: () => void;
  onBackToTask: () => void;
  onSimulateClientReply: () => void;
};

const text = {
  title: '邮件预览',
  subtitle: '人工审核后再发送。',
  to: '收件人',
  cc: '抄送',
  subject: '主题',
  followUp: '跟进等级',
  body: '邮件正文',
  evidence: '依据侧栏',
  missingDocument: '缺失资料',
  client: '客户',
  coverage: '覆盖率',
  confidence: '置信度',
  status: '任务状态',
  dataSource: '数据来源',
  source: '来源',
  processedVia: '处理方式',
  validation: '校验方式',
  taskOrigin: '任务来源',
  approve: '通过并发送',
  save: '保存草稿',
  back: '返回任务',
  waiting: '任务状态：等待客户',
  simulate: '模拟客户回复',
  completed: '已收到 6 月供应商发票，任务完成。',
} as const;

export function EmailPreview({
  subject,
  to,
  cc,
  followUpLevel,
  body,
  missingDocument,
  clientName,
  coverage,
  confidence,
  demoStatus,
  taskStatus,
  onBodyChange,
  onApproveSend,
  onSaveDraft,
  onBackToTask,
  onSimulateClientReply,
}: EmailPreviewProps) {
  const dataSourceItems = [
    { label: text.source, value: '邮件附件' },
    { label: text.processedVia, value: '文件 OCR（模拟）' },
    { label: text.validation, value: '完整性检查引擎' },
    { label: text.taskOrigin, value: '自动检测' },
  ];

  return (
    <div>
      <section className="card header-card">
        <h1 className="page-title" style={{ fontSize: 28 }}>{text.title}</h1>
        <p className="page-subtitle">{text.subtitle}</p>
      </section>

      {demoStatus === 'COMPLETED' && <section className="card" style={{ marginBottom: 16, borderColor: '#bbf7d0', background: '#ecfdf5' }}><strong>{text.completed}</strong></section>}

      <section className="grid-2">
        <article className="card">
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div><div className="sidebar-label">{text.to}</div><div>{to}</div></div>
            <div><div className="sidebar-label">{text.cc}</div><div>{cc}</div></div>
          </div>
          <div style={{ marginBottom: 16 }}><div className="sidebar-label">{text.subject}</div><div>{subject}</div></div>
          <div style={{ marginBottom: 16 }}><div className="sidebar-label">{text.followUp}</div><span className="badge badge-status">{followUpLevel}</span></div>
          <div>
            <div className="sidebar-label" style={{ marginBottom: 8 }}>{text.body}</div>
            <textarea value={body} onChange={(event) => onBodyChange(event.target.value)} className="card" style={{ width: '100%', minHeight: 260, borderRadius: 16 }} />
          </div>
          <div className="btn-group" style={{ marginTop: 16 }}>
            <button type="button" onClick={onApproveSend} className="btn btn-primary">{text.approve}</button>
            <button type="button" onClick={onSaveDraft} className="btn btn-secondary">{text.save}</button>
            <button type="button" onClick={onBackToTask} className="btn btn-ghost">{text.back}</button>
          </div>
          {demoStatus === 'WAITING_FOR_CLIENT' && <div className="card" style={{ marginTop: 16, background: '#f8fafc' }}><div className="row-flex"><strong>{text.waiting}</strong><button type="button" onClick={onSimulateClientReply} className="btn btn-primary">{text.simulate}</button></div></div>}
        </article>

        <aside className="card">
          <h2 className="card-title">{text.evidence}</h2>
          <div className="list">
            <div className="row"><span className="sidebar-label">{text.missingDocument}</span><strong>{missingDocument}</strong></div>
            <div className="row"><span className="sidebar-label">{text.client}</span><strong>{clientName}</strong></div>
            <div className="row"><span className="sidebar-label">{text.coverage}</span><strong>{coverage}%</strong></div>
            <div className="row"><span className="sidebar-label">{text.confidence}</span><strong>{confidence}%</strong></div>
            <div className="row"><span className="sidebar-label">{text.status}</span><strong>{taskStatus}</strong></div>
          </div>

          <section className="card" style={{ marginTop: 16, padding: 16 }}>
            <div className="sidebar-label" style={{ marginBottom: 10 }}>{text.dataSource}</div>
            <div className="list" style={{ gap: 8 }}>
              {dataSourceItems.map((item) => (
                <div key={item.label} className="row" style={{ padding: '12px 14px' }}>
                  <div className="card-subtle">{item.label}</div>
                  <div style={{ fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
