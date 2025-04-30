import http from './request'

export default {
    getReviewRequests(params: any)  {
        return http.get('/get_reviewRequest/all/',{ params })
    },
}
