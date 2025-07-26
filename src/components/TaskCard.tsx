import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in-progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-title">{task.title}</div>
      <div className="task-description">
        {task.description.length > 100
          ? `${task.description.substring(0, 100)}...`
          : task.description}
      </div>
      
      <div className="task-meta">
        <span className={`task-status ${getStatusClass(task.status)}`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>

      <div className="task-footer">
        <div className="task-assignee">
          <div className="assignee-avatar">
            {task.createdBy.username.charAt(0).toUpperCase()}
          </div>
          <span>{task.createdBy.username}</span>
        </div>
        <div>
          <span>Created: {formatDate(task.createdAt)}</span>
        </div>
      </div>

      {task.tags.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              style={{
                background: '#e9ecef',
                color: '#6c757d',
                padding: '0.2rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                marginRight: '0.5rem'
              }}
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span style={{ fontSize: '0.7rem', color: '#666' }}>
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard; 