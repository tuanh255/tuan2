import axios from 'axios';

const API_URL = "https://tuan2-p2ud.onrender.com/api/todos";
export const getTasks = (search, status) => {
    const url = `${API_URL}?search=${search}${status !== 'all' ? '&status=' + status : ''}`;
    return axios.get(url);
};

export const createTask = (taskData) => axios.post(API_URL, taskData);

export const updateTask = (id, updateData) => axios.patch(`${API_URL}/${id}`, updateData);

export const deleteTask = (id) => axios.delete(`${API_URL}/${id}`);