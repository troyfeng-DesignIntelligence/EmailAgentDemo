import { useEffect, useMemo, useState } from 'react';
import { clients as mockClients, documents as mockDocuments, emailDrafts, tasks as mockTasks } from './data/mockData';
import type { AppState, Client, DocumentRecord, Task, TaskStatus } from './types';
import { Dashboard } from './pages/Dashboard';
import { TaskDetail } from './pages/TaskDetail';
import { ClientWorkspace } from './pages/ClientWorkspace';
import { EmailPreview } from './pages/EmailPreview';
import { AgentStatusIndicator } from './components/AgentStatusIndicator';

type DemoStage = 'OPEN_TASK' | 'REVIEWING' | 'EMAIL_READY' | 'WAITING_FOR_CLIENT' | 'COMPLETED';
type Page = 'dashboard' | 'taskDetail' | 'clientWorkspace' | 'emailPreview';
type CopilotMessage = { role: 'ai' | 'user'; text: string };
type CopilotAction = 'generateEmail' | 'searchEmails' | 'markResolved';

type OpeningStatus = 'pending' | 'running' | 'completed' | 'warning';
type OpeningStep = { label: string; status: OpeningStatus; detail?: string };
type TaskFlowStatus = 'pending' | 'running' | 'success' | 'warning';
type TaskFlowStep = { label: string; status: TaskFlowStatus; detail?: string };

const DEMO_PROGRESS = ['发现缺失', '创建任务', '查看依据', '草拟跟进', '等待客户', '已完成'] as const;
const OPENING_TEMPLATE: OpeningStep[] = [
  { label: 'Reading client emails', status: 'completed' },
  { label: 'Extracting attachments', status: 'completed' },
  { label: 'Classifying documents', status: 'completed' },
  { label: 'Calling file.ai OCR', status: 'completed' },
  { label: 'Checking OCR confidence', status: 'warning', detail: 'Some attachments need a closer look' },
  { label: 'Posting to Xero', status: 'completed', detail: '5 entries posted' },
  { label: 'Completeness check', status: 'warning', detail: 'Missing June supplier invoice detected' },
  { label: 'Creating follow-up tasks', status: 'completed', detail: '1 high-priority task created' },
];

const initialState: AppState = {
  selectedTaskId: 'task-1',
  selectedClientId: 'client-1',
  view: 'dashboard',
};

const cloneClients = (): Client[] => structuredClone(mockClients);
const cloneTasks = (): Task[] => structuredClone(mockTasks);
const cloneDocuments = (): DocumentRecord[] => structuredClone(mockDocuments);

const TASK_FLOW_TEMPLATE: TaskFlowStep[] = [
  { label: 'Reading client emails', status: 'success' },
  { label: 'Extracting attachments', status: 'success' },
  { label: 'Classifying documents', status: 'success' },
  { label: 'Calling file.ai OCR', status: 'success' },
  { label: 'Checking OCR confidence', status: 'warning', detail: 'Some attachments need a closer look' },
  { label: 'Posting to Xero', status: 'success', detail: '5 entries posted' },
  { label: 'Completeness check', status: 'warning', detail: 'Missing June supplier invoice detected' },
  { label: 'Creating follow-up tasks', status: 'success', detail: '1 high-priority task created' },
];

const copy = {
  appTitle: 'AI 邮件自动化协作平台',
  appSubtitle: '发现缺失资料、辅助跟进并自动闭环。',
  taskFirst: '任务驱动演示',
  dashboard: '仪表盘',
  taskDetail: '任务详情',
  clientWorkspace: '客户工作台',
  emailPreview: '邮件预览',
  demoState: '演示状态',
  status: '状态',
  progress: '演示进度',
  completed: '已完成',
  waiting: '等待客户',
  success: '已收到 6 月供应商发票，任务完成。',
  navLabel: '导航',
  integration: '集成状态',
  language: '界面语言',
  onlyChinese: '仅中文',
  mocked: '模拟',
  active: '启用',
  planned: '规划中',
  copilotTitle: 'AI Copilot',
  copilotSubtitle: '当前页面上下文',
  copilotWelcome: '你好，我是你的 AI Copilot。我可以帮你理解问题、查找缺失资料，并执行后续动作。',
  askFollowup: '要不要我帮你生成一封跟进邮件？',
  issueAttention: '我发现有一个问题需要你关注。',
  followupPrompt: '要不要发送一封跟进邮件？',
  suggestedActions: '建议操作',
  generateEmail: '生成跟进邮件',
  searchEmails: '查找历史邮件',
  markResolved: '标记为已解决',
} as const;

function buildCopilotMessages(page: Page, client: Client, document: DocumentRecord): CopilotMessage[] {
  const base = [
    { role: 'ai' as const, text: `我检测到 ${client.name} 缺少 ${document.missingMonths.join('、')} 的供应商发票。` },
    { role: 'ai' as const, text: `当前覆盖率是 ${client.coverageRate}%。` },
  ];
  if (page === 'dashboard') return [{ role: 'ai', text: copy.issueAttention }, ...base, { role: 'ai', text: '点击下方建议，我会带你继续处理。' }];
  if (page === 'taskDetail') return [...base, { role: 'ai', text: '这个任务是系统根据客户文档分析自动创建的，不是人工手动录入。' }, { role: 'ai', text: copy.followupPrompt }];
  if (page === 'clientWorkspace') return [...base, { role: 'ai', text: '我已经整理了客户完整上下文，包括邮件时间线和处理轨迹。' }, { role: 'ai', text: '现在最合适的动作是发送一封 L1 跟进邮件。' }];
  return [...base, { role: 'ai', text: '我已经帮你打开邮件预览，你可以审核后直接发送。' }, { role: 'ai', text: '如果客户回复，我可以继续帮你完成任务。' }];
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [demoStage, setDemoStage] = useState<DemoStage>('OPEN_TASK');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('Open');
  const [emailBody, setEmailBody] = useState(emailDrafts[0].body);
  const [clients, setClients] = useState<Client[]>(cloneClients);
  const [tasks, setTasks] = useState<Task[]>(cloneTasks);
  const [documents, setDocuments] = useState<DocumentRecord[]>(cloneDocuments);
  const [successMessage, setSuccessMessage] = useState('');
  const [userNote, setUserNote] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [agentStatusMessage, setAgentStatusMessage] = useState('');
  const [agentStatusMode, setAgentStatusMode] = useState<'running' | 'completed' | 'hidden'>('hidden');
  const [taskFlowVisible, setTaskFlowVisible] = useState(true);
  const [taskFlowStage, setTaskFlowStage] = useState<TaskFlowStatus>('running');
  const [taskFlowSteps, setTaskFlowSteps] = useState<TaskFlowStep[]>(TASK_FLOW_TEMPLATE.map((step) => ({ ...step, status: 'pending' })));
  const [openingVisible, setOpeningVisible] = useState(true);
  const [openingSteps, setOpeningSteps] = useState<OpeningStep[]>(OPENING_TEMPLATE.map((step) => ({ ...step, status: 'pending' })));

  const selectedTask = useMemo(() => tasks.find((task) => task.id === state.selectedTaskId) ?? tasks[0], [state.selectedTaskId, tasks]);
  const selectedClient = useMemo(() => clients.find((client) => client.id === state.selectedClientId) ?? clients[0], [state.selectedClientId, clients]);
  const selectedDocument = useMemo(() => documents.find((document) => document.clientId === state.selectedClientId) ?? documents[0], [state.selectedClientId, documents]);
  const draft = emailDrafts[0];
  const navigate = (view: Page) => setState((prev) => ({ ...prev, view }));
  const pushCopilot = (message: string) => setCopilotMessages((prev) => [...prev, { role: 'ai', text: message }]);
  const pushUser = (message: string) => setCopilotMessages((prev) => [...prev, { role: 'user', text: message }]);

  const runAgentStatus = (runningMessage: string, completedMessage: string, action: () => void) => {
    setAgentStatusMode('running');
    setAgentStatusMessage(runningMessage);
    window.setTimeout(() => { action(); setAgentStatusMode('completed'); setAgentStatusMessage(completedMessage); }, 800);
  };

  const updateTaskFlowCopilot = (step: TaskFlowStep, index: number, stage: TaskFlowStatus) => {
    if (stage === 'running') {
      if (index === 2) setCopilotMessages((prev) => [...prev, { role: 'ai', text: "I’m classifying the documents now, please wait." }]);
      if (index === 4) setCopilotMessages((prev) => [...prev, { role: 'ai', text: "I’m checking OCR confidence..." }]);
      if (index === 5) setCopilotMessages((prev) => [...prev, { role: 'ai', text: "I’m posting high-confidence entries to Xero." }]);
      return;
    }
    if (stage === 'warning') {
      setCopilotMessages((prev) => [...prev, { role: 'ai', text: "I’ve found missing files, would you like me to proceed?" }]);
      return;
    }
    if (index === TASK_FLOW_TEMPLATE.length - 1) {
      setCopilotMessages((prev) => [...prev, { role: 'ai', text: 'AI has completed the task, please review the details.' }]);
    }
  };

  useEffect(() => {
    const timerIds: number[] = [];
    OPENING_TEMPLATE.forEach((_, index) => {
      const startDelay = index === 0 ? 120 : index * 900 + 120;
      const finishDelay = index * 900 + 820;
      timerIds.push(window.setTimeout(() => {
        setOpeningSteps((prev) => prev.map((step, stepIndex) => {
          if (stepIndex < index) return { ...step, status: OPENING_TEMPLATE[stepIndex].status, detail: OPENING_TEMPLATE[stepIndex].detail };
          if (stepIndex === index) return { ...step, status: 'running' };
          return { ...step, status: 'pending' };
        }));
      }, startDelay));
      timerIds.push(window.setTimeout(() => {
        setOpeningSteps((prev) => prev.map((step, stepIndex) => stepIndex === index ? { ...step, status: OPENING_TEMPLATE[index].status, detail: OPENING_TEMPLATE[index].detail } : step));
        if (index === OPENING_TEMPLATE.length - 1) {
          setOpeningVisible(false);
          setTasks((prev) => (prev.some((task) => task.id === 'task-1') ? prev : [mockTasks[0], ...prev]));
        }
      }, finishDelay));
    });
    return () => timerIds.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (!taskFlowVisible) return;
    const timers: number[] = [];
    TASK_FLOW_TEMPLATE.forEach((step, index) => {
      const startDelay = index * 1000;
      const finishDelay = index * 1000 + 850;
      timers.push(window.setTimeout(() => {
        setTaskFlowSteps((prev) => prev.map((item, itemIndex) => {
          if (itemIndex < index) return { ...item, status: TASK_FLOW_TEMPLATE[itemIndex].status, detail: TASK_FLOW_TEMPLATE[itemIndex].detail };
          if (itemIndex === index) return { ...item, status: 'running', detail: 'In progress' };
          return { ...item, status: 'pending' };
        }));
        setAgentStatusMode('running');
        setAgentStatusMessage(step.label);
        updateTaskFlowCopilot(step, index, 'running');
      }, startDelay));
      timers.push(window.setTimeout(() => {
        setTaskFlowSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, status: step.status, detail: step.detail } : item));
        setAgentStatusMode(step.status === 'warning' ? 'running' : 'completed');
        setAgentStatusMessage(step.status === 'warning' ? '等待人工审核' : index === TASK_FLOW_TEMPLATE.length - 1 ? '任务更新' : step.label);
        updateTaskFlowCopilot(step, index, step.status);
        if (index === 4) {
          setTaskStatus('In Progress');
          setDemoStage('REVIEWING');
        }
        if (index === TASK_FLOW_TEMPLATE.length - 1) {
          setTaskStatus('Completed');
          setDemoStage('COMPLETED');
          setTaskFlowStage('completed');
          setTaskFlowVisible(false);
          setSuccessMessage(copy.success);
        }
      }, finishDelay));
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [taskFlowVisible]);

  const openTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId) ?? tasks[0];
    setState({ selectedTaskId: task.id, selectedClientId: task.clientId, view: 'taskDetail' });
    setDemoStage('OPEN_TASK');
    setTaskStatus('Open');
    setSuccessMessage('');
  };

  const handleApproveSend = () => {
    runAgentStatus('Agent running: Updating task status...', 'Agent completed: Task updated', () => {
      setDemoStage('WAITING_FOR_CLIENT');
      setTaskStatus('Waiting');
      setTasks((prev) => prev.map((task) => (task.id === selectedTask.id ? { ...task, status: 'Waiting' } : task)));
      navigate('emailPreview');
    });
  };

  const handleSimulateClientReply = () => {
    runAgentStatus('Agent running: Processing client reply...', 'Agent completed: Missing document received', () => {
      setDemoStage('COMPLETED');
      setTaskStatus('Completed');
      setSuccessMessage(copy.success);
      setTasks((prev) => prev.map((task) => (task.id === selectedTask.id ? { ...task, status: 'Completed' } : task)));
      setClients((prev) => prev.map((client) => (client.id === selectedClient.id ? { ...client, coverageRate: 100, status: '待复核' } : client)));
      setDocuments((prev) => prev.map((document) => (document.clientId === selectedClient.id ? { ...document, receivedMonths: Array.from(new Set([...document.receivedMonths, 'Jun'])), missingMonths: [] } : document)));
      setState((prev) => ({ ...prev, view: 'dashboard' }));
      pushCopilot('我已将任务标记为已完成。');
    });
  };

  const appStatus = taskStatus === 'Waiting' ? copy.waiting : taskStatus === 'Completed' ? copy.completed : taskStatus;
  const currentStepIndex = demoStage === 'OPEN_TASK' ? 1 : demoStage === 'REVIEWING' ? 2 : demoStage === 'EMAIL_READY' ? 3 : demoStage === 'WAITING_FOR_CLIENT' ? 4 : demoStage === 'COMPLETED' ? 5 : 0;
  const pageCopilotMessages = useMemo(() => [...buildCopilotMessages(state.view, selectedClient, selectedDocument), ...copilotMessages], [state.view, selectedClient, selectedDocument, copilotMessages]);
  const taskFlowProgress = Math.round((taskFlowSteps.filter((step) => step.status === 'success' || step.status === 'warning').length / TASK_FLOW_TEMPLATE.length) * 100);

  const handleCopilotAction = (action: CopilotAction) => {
    if (action === 'generateEmail') {
      pushUser(copy.generateEmail);
      runAgentStatus('Agent running: Generating follow-up draft...', 'Agent completed: Draft ready', () => {
        setDemoStage('EMAIL_READY');
        navigate('emailPreview');
      });
      return;
    }
    if (action === 'searchEmails') {
      pushUser(copy.searchEmails);
      setState((prev) => ({ ...prev, view: 'clientWorkspace' }));
      pushCopilot('我已切换到客户工作台，方便查看邮件时间线和历史上下文。');
      return;
    }
    pushUser(copy.markResolved);
    runAgentStatus('Agent running: Processing client reply...', 'Agent completed: Missing document received', handleSimulateClientReply);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">AI 邮件自动化协作平台</div>
        <div className="brand-sub">{copy.taskFirst}</div>
        <div className="sidebar-card"><div className="sidebar-label">{copy.language}</div><div className="card-subtle" style={{ marginTop: 8 }}>{copy.onlyChinese}</div></div>
        <div className="nav">
          <div className="sidebar-label" style={{ marginTop: 8 }}>{copy.navLabel}</div>
          <button className={`nav-btn ${state.view === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>{copy.dashboard}</button>
          <button className={`nav-btn ${state.view === 'taskDetail' ? 'active' : ''}`} onClick={() => navigate('taskDetail')}>{copy.taskDetail}</button>
          <button className={`nav-btn ${state.view === 'clientWorkspace' ? 'active' : ''}`} onClick={() => navigate('clientWorkspace')}>{copy.clientWorkspace}</button>
          <button className={`nav-btn ${state.view === 'emailPreview' ? 'active' : ''}`} onClick={() => navigate('emailPreview')}>{copy.emailPreview}</button>
        </div>
        <div className="sidebar-card" style={{ marginTop: 20 }}>
          <div className="sidebar-label">{copy.demoState}</div>
          <div className="sidebar-value">{demoStage}</div>
          <div className="card-subtle" style={{ marginTop: 8 }}>{copy.status}：{appStatus}</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1 className="page-title">{copy.appTitle}</h1>
            <p className="page-subtitle">{copy.appSubtitle}</p>
          </div>
          <div className="topbar-stack">
            <div className="demo-pill">{selectedClient.name} · {selectedTask.title}</div>
            <AgentStatusIndicator message={agentStatusMessage || 'Agent idle'} mode={agentStatusMode} />
            <div className="task-status-mini">
              <div className="task-status-mini-head">
                <span className="sidebar-label">实时任务状态</span>
                <span className={`badge ${agentStatusMode === 'running' ? 'badge-medium' : agentStatusMode === 'completed' ? 'badge-low' : 'badge-muted'}`}>{agentStatusMode === 'running' ? 'Running' : agentStatusMode === 'completed' ? 'Success' : 'Idle'}</span>
              </div>
              <div className="task-status-progress"><span style={{ width: `${taskFlowProgress}%` }} /></div>
              <div className="task-status-text">{agentStatusMessage || copy.copilotWelcome}</div>
            </div>
          </div>
        </header>

        {successMessage && state.view === 'dashboard' && <section className="card" style={{ marginBottom: 16, borderColor: '#bbf7d0', background: '#ecfdf5' }}><strong>{successMessage}</strong></section>}
        {state.view === 'dashboard' && <Dashboard clients={clients} tasks={tasks} onOpenTask={openTask} />}
        {state.view === 'taskDetail' && taskFlowVisible && (
          <section className="card" style={{ marginBottom: 16 }}>
            <div className="row-flex" style={{ marginBottom: 12 }}>
              <div>
                <div className="sidebar-label">人工干预阶段</div>
                <h2 className="card-title" style={{ marginBottom: 6 }}>等待 CPA 审核</h2>
                <div className="card-subtle">AI has completed OCR, awaiting CPA to review and approve.</div>
              </div>
              <span className="badge badge-medium">等待人工审核</span>
            </div>
            <div className="task-status-progress"><span style={{ width: `${taskFlowProgress}%` }} /></div>
            <div className="task-status-text" style={{ marginTop: 10 }}>AI has classified documents, please review for accuracy.</div>
            <div className="btn-group" style={{ marginTop: 14 }}>
              <button type="button" className="btn btn-primary" onClick={() => { setTaskFlowVisible(false); setTaskStatus('Completed'); setAgentStatusMode('completed'); setAgentStatusMessage('任务完成'); setSuccessMessage('任务已由人工审核并完成更新。'); }}>
                标记人工审核完成
              </button>
            </div>
          </section>
        )}
        {state.view === 'taskDetail' && <TaskDetail onReviewEvidence={() => { setDemoStage('REVIEWING'); navigate('clientWorkspace'); }} onGenerateEmail={() => { setDemoStage('EMAIL_READY'); handleCopilotAction('generateEmail'); }} onBackToDashboard={() => { setDemoStage('OPEN_TASK'); navigate('dashboard'); }} />}
        {state.view === 'clientWorkspace' && <ClientWorkspace onGenerateEmail={() => { setDemoStage('EMAIL_READY'); handleCopilotAction('generateEmail'); }} onBackToTask={() => { setDemoStage('REVIEWING'); navigate('taskDetail'); }} />}
        {state.view === 'emailPreview' && <EmailPreview subject={draft.subject} to={draft.to} cc={draft.cc} followUpLevel={draft.followUpLevel} body={emailBody} missingDocument={selectedDocument.missingMonths[0] ?? '6月供应商发票'} clientName={selectedClient.name} coverage={selectedClient.coverageRate} confidence={92} demoStatus={demoStage} taskStatus={taskStatus} onBodyChange={setEmailBody} onApproveSend={handleApproveSend} onSaveDraft={() => setDemoStage('EMAIL_READY')} onBackToTask={() => navigate('taskDetail')} onSimulateClientReply={handleSimulateClientReply} />}
      </main>

      <aside className="ai-copilot">
        <div className="ai-copilot-header">
          <div><div className="ai-copilot-title">{copy.copilotTitle}</div><div className="ai-copilot-subtitle">{copy.copilotSubtitle}</div></div>
          <span className="badge badge-status">在线</span>
        </div>
        <AgentStatusIndicator message={agentStatusMessage || copy.copilotWelcome} mode={agentStatusMode} />
        <div className="copilot-chat">
          <div className="chat-bubble ai"><div className="chat-label">AI</div>{copy.copilotWelcome}</div>
          {pageCopilotMessages.map((message, index) => (<div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}><div className="chat-label">{message.role === 'ai' ? 'AI' : '你'}</div>{message.text}</div>))}
          {userNote && (<div className="chat-bubble user"><div className="chat-label">你</div>{userNote}</div>)}
          <div className="chat-bubble ai"><div className="chat-label">AI</div>{copy.askFollowup}</div>
          <div className="card" style={{ padding: 14, background: '#f8fafc' }}>
            <div className="sidebar-label">{copy.suggestedActions}</div>
            <div className="copilot-actions">
              <button className="copilot-action-btn primary" type="button" onClick={() => handleCopilotAction('generateEmail')}>{copy.generateEmail}</button>
              <button className="copilot-action-btn" type="button" onClick={() => handleCopilotAction('searchEmails')}>{copy.searchEmails}</button>
              <button className="copilot-action-btn" type="button" onClick={() => handleCopilotAction('markResolved')}>{copy.markResolved}</button>
            </div>
          </div>
        </div>
        <div className="chat-input-area"><textarea className="chat-input" placeholder="输入你的问题或指令……" value={userNote} onChange={(event) => setUserNote(event.target.value)} /><button className="chat-send" type="button" onClick={() => setUserNote('')}>发送</button></div>
      </aside>
    </div>
  );
}
