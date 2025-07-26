import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskAPI, userAPI } from '../services/api';
import socketService from '../services/socket';
import { Task, User } from '../types';

interface TaskDetailProps {
  user: User;
  onLogout: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ user, onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchUsers();
      socketService.joinRoom('tasks');

      socketService.onTaskUpdated((updatedTask) => {
        if (updatedTask._id === id) {
          setTask(updatedTask);
          // Determine what was updated for better toast message
          let msg = 'Task updated!';
          if (task) {
            if (task.status !== updatedTask.status) {
              msg = 'Task status updated successfully!';
            } else if (task.title !== updatedTask.title || task.description !== updatedTask.description) {
              msg = 'Task details updated successfully!';
            }
          }
          setToastMsg(msg);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
        }
      });
    }

    return () => {
      socketService.off('task-updated');
    };
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await taskAPI.getTask(id!);
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (!task) return;
    try {
      const response = await taskAPI.updateTask(task._id, { status: newStatus });
      setTask(response.data);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditTitle(task?.title || '');
    setEditDescription(task?.description || '');
  };

  const handleSaveEdit = async () => {
    if (!task) return;
    try {
      const response = await taskAPI.updateTask(task._id, {
        title: editTitle,
        description: editDescription
      });
      setTask(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error saving edits:', error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await taskAPI.deleteTask(task._id);
      socketService.emitTaskDeleted(task._id);
      setShowDeleteModal(false);
      navigate('/');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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



  if (loading) {
    return <div className="loading">Loading task...</div>;
  }

  if (!task) {
    return <div className="loading">Task not found</div>;
  }

  return (
    <div>
      {/* Removed duplicate header, use Navbar for layout */}

      <div className="container">
        <div className="task-detail">
          <div className="task-detail-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              {editing && user.username === task.createdBy.username ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="border px-2 py-1 rounded w-full font-bold text-xl mb-2"
                />
              ) : (
                <h1 className="task-detail-title">{task.title}</h1>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {user.username === task.createdBy.username && !editing && (
                  <button
                    onClick={handleEdit}
                    className="btn btn-primary"
                  >
                    Edit
                  </button>
                )}
                {editing && user.username === task.createdBy.username && (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="btn btn-success"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {user.username === task.createdBy.username && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                )}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Delete Task</h3>
            <p className="mb-6">Are you sure you want to delete this task?</p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
              </div>
            </div>

            {editing && user.username === task.createdBy.username ? (
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="border px-2 py-1 rounded w-full mb-2"
                rows={3}
              />
            ) : (
              <p className="task-detail-description">{task.description}</p>
            )}
      {showToast && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold text-base animate-bounce">
          {toastMsg}
        </div>
      )}

            <div className="task-detail-meta">
              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className={`meta-value ${getStatusClass(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
                {/* Status update buttons for all users */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {(['pending', 'in-progress', 'completed'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`btn ${task.status === status ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem' }}
                    >
                      {status.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created By</span>
                <span className="meta-value">{task.createdBy.username}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created</span>
                <span className="meta-value">{formatDate(task.createdAt)}</span>
              </div>
            </div>

            {task.tags.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <span className="meta-label">Tags</span>
                <div style={{ marginTop: '0.5rem' }}>
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        marginRight: '0.5rem',
                        display: 'inline-block',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {editing && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
                <h3>Quick Status Update</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {(['pending', 'in-progress', 'completed'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`btn ${task.status === status ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem' }}
                    >
                      {status.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 