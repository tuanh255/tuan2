import React, { useState } from 'react';
import * as taskApi from '../api/taskApi';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';

const TaskInput = ({ task, onClose, refresh }) => {
  const [formData, setFormData] = useState(task || { title: '', description: '', startDate: '', endDate: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let errs = {};
    if (!formData.title?.trim()) errs.title = "Vui lòng nhập tiêu đề";
    if (!formData.startDate) errs.startDate = "Chọn ngày bắt đầu";
    if (!formData.endDate) errs.endDate = "Chọn hạn chót";
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errs.endDate = "Hạn chót không được trước ngày bắt đầu";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const msg = task ? "Bạn có chắc muốn cập nhật thay đổi này?" : "Bạn có chắc muốn thêm nhiệm vụ mới này?";
    if (!window.confirm(msg)) return;

    try {
      task ? await taskApi.updateTask(task._id, formData) : await taskApi.createTask(formData);
      toast.success("Thực hiện thành công!");
      refresh(); onClose();
    } catch (err) { toast.error("Lỗi xử lý dữ liệu"); }
  };

  const handleDelete = async () => {
    if (window.confirm("Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?")) {
      try {
        await taskApi.deleteTask(task._id);
        toast.info("Đã xóa nhiệm vụ");
        refresh(); onClose();
      } catch (err) { toast.error("Lỗi khi xóa"); }
    }
  };

  return (
  <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
    <div className="modal-card animate-in">
      <div className="modal-header">
<h3 style={{ color: "#1e293b" }}>
  {task ? "CHI TIẾT NHIỆM VỤ" : "NHIỆM VỤ MỚI"}
</h3>
        {/* <X className="close-icon" onClick={onClose} style={{cursor: 'pointer'}} /> */}
      </div>

      <form onSubmit={handleSave} className="modal-form">
        <div className={`field ${errors.title ? 'error' : ''}`}>
          <label>Nhiệm vụ</label>
          <div className="input-inner">
            <input 
              value={formData.title} 
              placeholder="Nhập tên nhiệm vụ..." 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          {errors.title && <small className="error-text">{errors.title}</small>}
        </div>

        <div className="field">
          <label>Mô tả</label>
          <div className="input-inner">
            <textarea 
              value={formData.description} 
              placeholder="Mô tả chi tiết..." 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
        </div>

        <div className="grid-dates">
          <div className={`field ${errors.startDate ? 'error' : ''}`}>
            <label>Thời gian bắt đầu</label>
            <div className="input-inner">
              <input 
                type="datetime-local" 
                value={formData.startDate?.slice(0, 16)} 
                onChange={e => setFormData({...formData, startDate: e.target.value})} 
              />
            </div>
            {errors.startDate && <small className="error-text">{errors.startDate}</small>}
          </div>

          <div className={`field ${errors.endDate ? 'error' : ''}`}>
            <label>Thời gian kết thúc</label>
            <div className="input-inner">
              <input 
                type="datetime-local" 
                value={formData.endDate?.slice(0, 16)} 
                onChange={e => setFormData({...formData, endDate: e.target.value})} 
              />
            </div>
          </div>
        </div>
        {errors.endDate && <small className="error-text-bottom">{errors.endDate}</small>}

        <div className="footer-btns">
          {task && <button type="button" className="btn-del" onClick={handleDelete}><Trash2 size={18}/></button>}
          <button type="submit" className="btn-save">{task ? "Cập nhật" : "Thêm mới"}</button>
        </div>
      </form>
    </div>
  </div>
);
};

export default TaskInput;