import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as taskApi from './api/taskApi.js';
import TaskItem from './components/TaskItem';
import TaskInput from './components/TaskInput';
import { Plus, Search } from 'lucide-react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTasks = async () => {
    try {
      const res = await taskApi.getTasks(search, filter);
      const sorted = res.data.sort((a, b) => {
        const statusOrder = { 'pending': 1, 'out of date': 2, 'completed': 3 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(a.endDate) - new Date(b.endDate);
      });
      setTasks(sorted);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu");
    }
  };

  useEffect(() => { loadTasks(); }, [search, filter]);

  const handleToggleComplete = async (id, currentStatus) => {
    // LOGIC MỚI: Nếu là out of date thì không cho tích nhanh
    if (currentStatus === 'out of date') {
      toast.warning("Nhiệm vụ đã quá hạn! Vui lòng cập nhật lại thời gian trong chi tiết.");
      return;
    }

    const action = currentStatus === 'completed' ? "khôi phục" : "hoàn thành";
    if (!window.confirm(`Bạn có chắc muốn đánh dấu ${action} nhiệm vụ này?`)) return;

    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await taskApi.updateTask(id, { status: newStatus });
      toast.success("Cập nhật thành công!");
      loadTasks();
    } catch (err) { toast.error("Lỗi cập nhật"); }
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="todo-card">
        <div className="search-bar">
          <Search size={18} color="#94a3b8" />
          <input placeholder="Tìm kiếm nhiệm vụ..." onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="filter-tabs">
          {['all', 'pending', 'completed', 'out of date'].map(s => (
            <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="task-list">
          {tasks.map(t => (
            <TaskItem 
              key={t._id} 
              task={t} 
              onToggleComplete={handleToggleComplete}
              onClick={() => { setSelectedTask(t); setIsModalOpen(true); }} 
            />
          ))}
        </div>

<button 
  className="fab-add" 
  onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
  title="Thêm nhiệm vụ mới"
>
  <Plus size={32} strokeWidth={2.5} color="white" />
</button>
      </div>

      {isModalOpen && (
        <TaskInput 
          task={selectedTask} 
          onClose={() => setIsModalOpen(false)} 
          refresh={loadTasks} 
        />
      )}
    </div>
  );
}

export default App;