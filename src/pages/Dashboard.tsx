import { useMemo, useState } from 'react';
import type { Client, Task } from '../types';

type DashboardProps = {
  clients: Client[];
  tasks: Task[];
  onOpenTask: (taskId: string) => void;
};

function roleBadgeClass(role: Task['assignedRole']) {
  switch (role) {
    case 'CPA': return 'badge-cpa';
    case 'Manager': return 'badge-manager';
    case 'CST': return 'badge-cst';
    case 'Accountant':
    default: return 'badge-accountant';
  }
}

function priorityBadgeClass(priority: Task['priority']) {
  switch (priority) {
    case 'High': return 'badge-high';
    case 'Medium': return 'badge-medium';
    case 'Low':
    default: return 'badge-low';
  }
}

const text = {
  openTasks: '待办任务',
  missingDocs: '缺少资料',
  waitingClient: '等待客户',
  highRisk: '高风险客户',
  needsReview: '今日需处理',
  detected: 'AI 识别',
  pendingReply: '等待回复',
  attention: '覆盖率需关注',
  priorityTasks: '优先任务',
  recentActivity: '最近动态',
  highPriority: '高优先级',
  mediumPriority: '中优先级',
  lowPriority: '低优先级',
  assignedRole: '指派角色',
  assignedTo: '负责人',
  status: '状态',
  automationPipeline: '自动化流程',
  pipelineSubtitle: '系统后台正在处理邮件、附件和缺票判断',
  focusTitle: '今天优先处理',
  focusSubtitle: '系统已识别出最重要的任务，直接从这里开始处理。',
  focusCta: '打开任务',
  collapsedHint: '点击可展开其他任务',
  expandedHint: '点击收起',
} as const;

const pipeline = [
  { name: '邮件收件箱', status: 'Mocked' },
  { name: '文件 OCR', status: 'Mocked' },
  { name: '文档分类', status: 'Mocked' },
  { name: '完整性检查', status: 'Active' },
  { name: '任务编排器', status: 'Active' },
  { name: 'Xero', status: 'Planned' },
] as const;

function pipelineBadgeClass(status: (typeof pipeline)[number]['status']) {
  switch (status) {
    case 'Active': return 'badge-low';
    case 'Planned': return 'badge-blue';
    case 'Mocked':
    default: return 'badge-muted';
  }
}

function statusLabel(status: (typeof pipeline)[number]['status']) {
  switch (status) {
    case 'Active': return '启用';
    case 'Planned': return '规划中';
    case 'Mocked':
    default: return '模拟';
  }
}

export function Dashboard({ clients, tasks, onOpenTask }: DashboardProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(tasks[0]?.id ?? null);
  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => {
    const priorityRank = { High: 0, Medium: 1, Low: 2 } as const;
    return priorityRank[a.priority] - priorityRank[b.priority] || a.dueDate.localeCompare(b.dueDate);
  }), [tasks]);
  const priorityTask = sortedTasks[0] ?? tasks[0];
  const summaryCards = [
    { label: text.openTasks, value: tasks.filter((task) => task.status === 'Open').length, note: text.needsReview },
    { label: text.missingDocs, value: 3, note: text.detected },
    { label: text.waitingClient, value: tasks.filter((task) => task.status === 'Waiting').length, note: text.pendingReply },
    { label: text.highRisk, value: clients.filter((client) => client.riskLevel === 'High').length, note: text.attention },
  ];

  const activityItems = ['系统检测到缺少 6 月供应商发票', 'AI 创建跟进任务', '文档覆盖率下降至 83%'];

  return (
    <div>
      <section className="card" style={{ marginBottom: 16, borderColor: '#c4b5fd', background: 'linear-gradient(180deg, #fff, #faf5ff)' }}>
        <div className="row-flex">
          <div>
            <div className="sidebar-label">{text.focusTitle}</div>
            <h2 className="card-title" style={{ marginBottom: 6 }}>{priorityTask.title}</h2>
            <div className="card-subtle">{text.focusSubtitle}</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => onOpenTask(priorityTask.id)}>{text.focusCta}</button>
        </div>
        <div className="btn-group" style={{ marginTop: 14 }}>
          <span className="badge badge-high">{priorityTask.priority} {text.highPriority}</span>
          <span className={`badge ${roleBadgeClass(priorityTask.assignedRole)}`}>{text.assignedRole}：{priorityTask.assignedRole}</span>
          <span className="badge badge-status">{text.status}：{priorityTask.status}</span>
        </div>
      </section>

      <section className="grid-4" style={{ marginBottom: 16 }}>
        {summaryCards.map((card) => (
          <article key={card.label} className="card">
            <div className="card-subtle">{card.label}</div>
            <div className="kpi">{card.value}</div>
            <div className="card-subtle" style={{ marginTop: 6 }}>{card.note}</div>
          </article>
        ))}
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="row-flex" style={{ marginBottom: 16 }}>
          <div>
            <h2 className="card-title" style={{ marginBottom: 6 }}>{text.automationPipeline}</h2>
            <div className="card-subtle">{text.pipelineSubtitle}</div>
          </div>
        </div>

        <div className="pipeline-scroll">
          <div className="pipeline">
            {pipeline.map((node, index) => (
              <div key={node.name} className="pipeline-item-wrap">
                <div className="pipeline-node card" style={{ minWidth: 150, padding: 16 }}>
                  <div className="pipeline-node-title">{node.name}</div>
                  <span className={`badge ${pipelineBadgeClass(node.status)}`}>{statusLabel(node.status)}</span>
                </div>
                {index < pipeline.length - 1 && <div className="pipeline-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="two-col">
        <article className="card">
          <div className="row-flex" style={{ marginBottom: 14 }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>{text.priorityTasks}</h2>
            <span className="card-subtle">{text.collapsedHint}</span>
          </div>
          <div className="list">
            {sortedTasks.map((task, index) => {
              const client = clients.find((item) => item.id === task.clientId);
              const collapsed = task.id !== expandedTaskId && task.priority !== 'High';
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    if (task.id === expandedTaskId) {
                      setExpandedTaskId(null);
                      return;
                    }
                    setExpandedTaskId(task.id);
                  }}
                  className={`row row-clickable ${index === 0 ? 'row-primary' : ''}`}
                >
                  <div className="row-flex">
                    <div>
                      <div className="row-title">{task.title}</div>
                      <div className="row-meta">{client?.name}</div>
                    </div>
                    <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                      <span className={`badge ${priorityBadgeClass(task.priority)}`}>{task.priority} {task.priority === 'High' ? text.highPriority : task.priority === 'Medium' ? text.mediumPriority : text.lowPriority}</span>
                      <span className={`badge ${roleBadgeClass(task.assignedRole)}`}>{text.assignedRole}：{task.assignedRole}</span>
                    </div>
                  </div>
                  {task.id === expandedTaskId && (
                    <>
                      <div className="row-flex">
                        <span className="card-subtle">{text.assignedTo} {task.assignedRole}</span>
                        <span className="badge badge-status">{text.status}：{task.status}</span>
                      </div>
                      <div className="card-subtle">到期 {task.dueDate} · 创建于 {task.createdAt}</div>
                    </>
                  )}
                  {collapsed && (
                    <div className="card-subtle">{text.collapsedHint}</div>
                  )}
                  {task.id === expandedTaskId && task.priority !== 'High' && (
                    <div className="card-subtle">{text.expandedHint}</div>
                  )}
                </button>
              );
            })}
          </div>
        </article>

        <article className="card">
          <h2 className="card-title">{text.recentActivity}</h2>
          <div className="list">
            {activityItems.map((item) => <div key={item} className="row">{item}</div>)}
          </div>
        </article>
      </section>
    </div>
  );
}
