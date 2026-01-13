import React from 'react';
import { Check, Calendar, Lock } from 'lucide-react';
// 1. Import hàm format đã tạo ở utils
import { formatToVN } from '../utils/dayjs'; 

const TaskItem = ({ task, onToggleComplete, onClick }) => {
  const handleCheck = (e) => {
    e.stopPropagation();
    onToggleComplete(task._id, task.status);
  };

  // 2. Xóa hàm formatDate cũ dùng Date thuần đi và thay thế bằng dayjs
  // (Chúng ta sẽ gọi trực tiếp formatToVN ở dưới phần render)

  return (
    <div className={`task-item-premium ${task.status}`} onClick={onClick}>
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
          <Calendar size={12} style={{ marginRight: '4px' }} />
          {/* 3. Sử dụng hàm formatToVN để hiển thị đúng giờ +7 */}
          {formatToVN(task.startDate)} — {formatToVN(task.endDate)}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;