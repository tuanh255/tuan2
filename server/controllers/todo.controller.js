const Todo = require('../models/todo.model');
const { checkMissingParams } = require('../utils/validate.utils');

//Lấy danh sách + tìm kiếm + lọc theo trạng thái
exports.getTodos = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};
        if (search) query.title = { $regex: search, $options: 'i' };
        if (status) query.status = status;

        // 1. Lấy dữ liệu từ DB
        let todos = await Todo.find(query).sort({ createdAt: -1 });

        const now = new Date();
        // 2. Cập nhật trạng thái Out of date thực tế
        const updatedTodos = await Promise.all(todos.map(async (todo) => {
            if (todo.status === 'pending' && todo.endDate && new Date(todo.endDate) < now) {
                todo.status = 'out of date';
                await todo.save(); 
            }
            return todo;
        }));

        // 3. TT ƯU TIÊN 
        const priority = {
            'pending': 1,     
            'completed': 2,    
            'out of date': 3   
        };

        // 4. THỰC HIỆN SẮP XẾP MẢNG TRƯỚC KHI TRẢ VỀ
        updatedTodos.sort((a, b) => {
            // So sánh dựa trên bảng ưu tiên ở trên
            if (priority[a.status] !== priority[b.status]) {
                return priority[a.status] - priority[b.status];
            }
            // Nếu cùng trạng thái thì cái nào mới tạo (createdAt) hiện lên trước
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 5. Trả dữ liệu đã được sắp xếp về cho Frontend
        res.status(200).json(updatedTodos);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Tạo mới công việc
exports.createTodo = async (req, res) => {
    try {
        // 1. Kiểm tra thiếu trường dữ liệu
        const errorMissing = checkMissingParams(req.body, ['title', 'startDate', 'endDate']);
        if (errorMissing) return res.status(400).json({ message: errorMissing });

        const { startDate, endDate } = req.body;
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        // 2. CHẶN THỜI GIAN TRONG QUÁ KHỨ
        // Nếu bạn muốn ngày bắt đầu phải từ hiện tại trở đi
        if (start < now.setSeconds(0, 0)) { 
            return res.status(400).json({ message: "Ngày bắt đầu không được ở trong quá khứ" });
        }

        // 3. CHẶN HẠN CHÓT TRONG QUÁ KHỨ
        if (end < now) {
            return res.status(400).json({ message: "Hạn chót không được ở trong quá khứ" });
        }

        // 4. CHẶN NGÀY KẾT THÚC TRƯỚC NGÀY BẮT ĐẦU
        if (end <= start) {
            return res.status(400).json({ message: "Hạn chót phải sau ngày bắt đầu" });
        }

        // Nếu vượt qua hết các điều kiện trên mới tiến hành lưu
        const newTodo = new Todo(req.body);
        const saveTodo = await newTodo.save();
        res.status(201).json(saveTodo);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Cập nhật
exports.updateTodo = async (req, res) => {
  try {
    const { title, startDate, endDate } = req.body;
    const now = new Date();

    // 1. Nếu có sửa tiêu đề, kiểm tra xem có để trống không
    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({ message: "Tiêu đề không được để trống" });
    }

    // 2. Nếu có sửa ngày tháng, kiểm tra logic thời gian
    if (startDate || endDate) {
        // Lấy dữ liệu hiện tại từ DB để so sánh nếu người dùng chỉ sửa 1 trong 2 ngày
        const currentTodo = await Todo.findById(req.params.id);
        const start = new Date(startDate || currentTodo.startDate);
        const end = new Date(endDate || currentTodo.endDate);

        // Chặn hạn chót không được ở quá khứ
        if (endDate && end < now) {
            return res.status(400).json({ message: "Hạn chót mới không được ở quá khứ" });
        }

        // Chặn hạn chót trước ngày bắt đầu
        if (end <= start) {
            return res.status(400).json({ message: "Hạn chót phải sau ngày bắt đầu" });
        }
        
        // Logic Gia hạn: Nếu đang 'out of date' mà cập nhật endDate hợp lệ -> tự động về 'pending'
        if (currentTodo.status === 'out of date' && end > now) {
            req.body.status = 'pending';
        }
    }

    // 3. Tiến hành cập nhật
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedTodo) {
        return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" });
    }

    res.status(200).json(updatedTodo);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa Todo
exports.deleteTodo = async (req, res) => {
  try {
    // 1. Todo.findByIdAndDelete: Lệnh "Tìm theo ID và Xóa sổ luôn"
    // Nó sẽ vào MongoDB, tìm đúng cái ID bạn gửi lên và xóa vĩnh viễn dữ liệu đó.
    await Todo.findByIdAndDelete(req.params.id);

    // 2. req.params.id: Giống như hàm Update, lấy ID từ URL
    // Ví dụ: DELETE /api/todos/123 -> id là "123"

    // 3. await: Phải đợi Database xác nhận là đã xóa xong mới chạy tiếp dòng dưới.

    // 4. res.status(200).json(...): 
    // Vì sau khi xóa thì dữ liệu không còn nữa, nên chúng ta không trả về Todo đó.
    // Thay vào đó, trả về một lời nhắn (message) để React biết là "Đã xóa xong rồi nhé!".
    res.status(200).json({ message: "Deleted successfully" });

  } catch (error) {
    // 5. Trả về lỗi 500 nếu có sự cố (ví dụ: ID sai định dạng của MongoDB)
    res.status(500).json({ message: error.message });
  }
};
