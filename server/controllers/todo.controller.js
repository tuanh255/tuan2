const Todo = require('../models/todo.model');
const { checkMissingParams } = require('../utils/validate.utils');
const vnDayjs = require('../utils/dayjs');

// 1. LẤY DANH SÁCH + TÌM KIẾM + TỐI ƯU UPDATE HÀNG LOẠT
exports.getTodos = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};
        
        if (search) query.title = { $regex: search, $options: 'i' };
        if (status) query.status = status;

        const now = vnDayjs().toDate();

        // Thay vì loop qua từng todo để .save(), ta dùng 1 lệnh duy nhất gửi tới DB
        await Todo.updateMany(
            { 
                status: 'pending', 
                endDate: { $lt: now } 
            },
            { $set: { status: 'out of date' } }
        );

        // Lấy dữ liệu (Sử dụng lean() để tăng tốc độ đọc)
        let todos = await Todo.find(query).sort({ createdAt: -1 }).lean();

        const priorityScore = {
            'pending': 1,
            'completed': 2,
            'out of date': 3
        };

        todos.sort((a, b) => {
            // So sánh theo trạng thái ưu tiên
            if (priorityScore[a.status] !== priorityScore[b.status]) {
                return priorityScore[a.status] - priorityScore[b.status];
            }
            // Nếu cùng trạng thái, cái nào mới tạo hiện lên trước
            return vnDayjs(b.createdAt).diff(vnDayjs(a.createdAt));
        });

        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. TẠO MỚI CÔNG VIỆC 
exports.createTodo = async (req, res) => {
    try {
        const errorMissing = checkMissingParams(req.body, ['title', 'startDate', 'endDate']);
        if (errorMissing) return res.status(400).json({ message: errorMissing });

        const now = vnDayjs().startOf('minute'); 
        const start = vnDayjs(req.body.startDate);
        const end = vnDayjs(req.body.endDate);

        if (start.isBefore(now)) { 
            return res.status(400).json({ message: "Ngày bắt đầu không được ở trong quá khứ" });
        }
        if (end.isBefore(start) || end.isSame(start)) {
            return res.status(400).json({ message: "Hạn chót phải sau ngày bắt đầu" });
        }

        const newTodo = new Todo(req.body);
        const saveTodo = await newTodo.save();
        res.status(201).json(saveTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. CẬP NHẬT CÔNG VIỆC
exports.updateTodo = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const now = vnDayjs();
        const currentTodo = await Todo.findById(req.params.id);

        if (!currentTodo) return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" });

        if (startDate || endDate) {
            const start = vnDayjs(startDate || currentTodo.startDate);
            const end = vnDayjs(endDate || currentTodo.endDate);

            if (endDate && end.isBefore(now)) {
                return res.status(400).json({ message: "Hạn chót mới không được ở quá khứ" });
            }
            if (end.isBefore(start) || end.isSame(start)) {
                return res.status(400).json({ message: "Hạn chót phải sau ngày bắt đầu" });
            }
            // Nếu task đang quá hạn mà người dùng gia hạn thêm, chuyển về pending
            if (currentTodo.status === 'out of date' && end.isAfter(now)) {
                req.body.status = 'pending';
            }
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. XÓA CÔNG VIỆC
exports.deleteTodo = async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};