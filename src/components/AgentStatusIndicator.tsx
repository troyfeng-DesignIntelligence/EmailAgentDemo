type AgentStatusIndicatorProps = {
  message: string;
  mode?: 'running' | 'completed' | 'hidden';
  compact?: boolean;
};

export function AgentStatusIndicator({ message, mode = 'running', compact = true }: AgentStatusIndicatorProps) {
  if (mode === 'hidden') return null;

  return (
    <div className={`agent-status-indicator ${mode} ${compact ? 'compact' : ''}`}>
      <span className="agent-status-dot" />
      <span className="agent-status-message">{message}</span>
    </div>
  );
}
