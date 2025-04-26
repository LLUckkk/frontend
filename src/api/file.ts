import http from './request'
import { ref } from 'vue'


export default {
  // 获取文件列表
  getFiles(params: {
    page: number;
    page_size: number;
    query?: string;
    categories?: string;
    startTime?: string;
    endTime?: string;
  }) {
    return http.get('/get_files/', { params });
  },

  // 删除文件
  deleteFile(fileId: number) {
    return http.delete(`/upload/${fileId}/delete/`);
  }
}
