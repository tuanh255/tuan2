import React from 'react';
import { Check, Calendar, Lock } from 'lucide-react';

const TaskItem = ({ task, onToggleComplete, onClick }) => {
  const handleCheck = (e) => {
    e.stopPropagation();
    onToggleComplete(task._id, task.status);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.toLocaleDateString('vi-VN')}`;
  };

  return (
    <div className={`task-item-premium ${task.status}`} onClick={onClick}>
      {/* Cập nhật logic hiển thị hình tròn */}
      <div 
        className={`custom-check ${task.status === 'completed' ? 'checked' : ''} ${task.status === 'out of date' ? 'disabled' : ''}`} 
        onClick={handleCheck}
      >
        {task.status === 'completed' && <Check size={14} strokeWidth={4} color="white" />}
        {task.status === 'out of date' && <Lock size={12} color="#fca5a5" />}
      </div>
      
      <div className="task-body">
        <strong className={`task-title-bold ${task.status === 'completed' ? 'strikethrough' : ''} ${task.status === 'out of date' ? 'text-overdue' : ''}`}>
          {task.title}
        </strong>
        <div className="task-time-faded">
          <Calendar size={12} style={{marginRight: '4px'}}/>
          {formatDate(task.startDate)} — {formatDate(task.endDate)}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;