import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, userAPI } from '../services/api';
import socketService from '../services/socket';
import { Task, User } from '../types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import {
  containerClass,
  cardClass,
  buttonClass,
  inputClass,
  flexCenterClass,
  headingClass,
  loadingClass
} from '../styles/twClasses';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    socketService.joinRoom('tasks');

    socketService.onTaskCreated((task) => {
      setTasks(prev => {
        if (prev.some(t => t._id === task._id)) return prev;
        return [task, ...prev];
      });
    });

    socketService.onTaskUpdated((updatedTask) => {
      setTasks(prev => prev.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ));
    });

    socketService.onTaskDeleted((taskId) => {
      setTasks(prev => prev.filter(task => task._id !== taskId));
    });

    return () => {
      socketService.off('task-created');
      socketService.off('task-updated');
      socketService.off('task-deleted');
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasks(filters);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/task/${taskId}`);
  };

  const handleCreateTask = () => {
    setShowModal(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => {
      if (prev.some(t => t._id === newTask._id)) return prev;
      return [newTask, ...prev];
    });
    setShowModal(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return <div className={loadingClass}>Loading tasks...</div>;
  }

  return (
    <div className={containerClass}>
      {/* User info and logout button can be moved to Navbar if needed */}

      <div className={cardClass}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={headingClass}>My Tasks</h1>
          <button onClick={handleCreateTask} className={buttonClass}>
            Create Task
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={inputClass}
          />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={inputClass}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No tasks found. Create your first task!</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => handleTaskClick(task._id)}
              />
            ))
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          users={users}
          onClose={() => setShowModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default Dashboard; 