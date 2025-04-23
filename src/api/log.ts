import http from './request'

export default {
  getLogs(params: {
    page: number;
    page_size: number;
    query?: string;
    role?: string;
    operation_type?: string;
    startTime?: string;
    endTime?: string;
  }) {
    return http.get('/user_action_log/', { params });
  },

  deleteLog(logId: number) {
    return http.delete(`/user_action_log/${logId}/`);
  },

  downloadLogs(params: {
    role?: string;
    operation_type?: string;
    startTime?: string;
    endTime?: string;
  }) {
    return http.get('/user_action_log/download/', { 
      params,
      responseType: 'blob'
    });
  }
} 