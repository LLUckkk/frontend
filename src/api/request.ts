//引入axios
import axios from 'axios'
import router from '@/router'
// 创建axios实例
const instance = axios.create({
    //配置
    baseURL: import.meta.env.VITE_API_URL+"/api", //接口请求的域名地址
    timeout: 5000,//请求超时时间
    headers:{}, //设置请求头信息
})
 
//请求拦截处理 
instance.interceptors.request.use(config=>{
    let token = localStorage.getItem('token')
    if(token){
        config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
},
    //请求报错的返回信息
    error=>{
        return Promise.reject(error)
    }
)
 
//相应拦截处理
instance.interceptors.response.use(response=>{
    return response
},
 error=>{
    // 处理401错误，尝试刷新token
    if (error.response && error.response.status === 401) {
        return refreshToken().then(newToken => {
            // 更新请求头中的token
            error.config.headers['Authorization'] = 'Bearer ' + newToken
            // 重试原始请求
            return instance(error.config)
        }).catch(err => {
            // 刷新token失败，跳转到登录页
            localStorage.removeItem('token')
            localStorage.removeItem('refresh')
            router.push('/login')
            return Promise.reject(err)
        })
    }
    return Promise.reject(error)
  }
)

// 刷新token的函数
const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh')
    if (!refresh) {
        return Promise.reject(new Error('No refresh token available'))
    }
    
    try {
        const response = await axios.post(
            import.meta.env.VITE_API_URL + '/api/token/refresh/',
            { refresh: refresh }
        )
        
        if (response.data && response.data.access) {
            // 保存新的access token
            localStorage.setItem('token', response.data.access)
            return response.data.access
        } else {
            return Promise.reject(new Error('Invalid response format'))
        }
    } catch (error) {
        return Promise.reject(error)
    }
}
 
//导出axios
export default instance