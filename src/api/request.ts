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
        config.headers['Authorization'] = 'Bearer' + token
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
    return error
  }
)
 
//导出axios
export default instance