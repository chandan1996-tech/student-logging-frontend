import axios from "axios";

const API_URL = "http://localhost:8080/api/students";

const studentService = {
  getAll: () => axios.get(API_URL),
  create: (student) => axios.post(API_URL, student),
  update: (id, student) => axios.put(`${API_URL}/${id}`, student),
  delete: (id) => axios.delete(`${API_URL}/${id}`),
};

export default studentService;
