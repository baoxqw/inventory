import axios from 'axios';

const instance = axios.create({
    baseURL: 'http:10.123.67.114:8090',
    timeout: 8000,
    headers: {
        //'X-Custom-Header': 'foobar',
        'Content-Type': 'application/json;charset=UTF-8'
    }
});

//请求拦截处理
instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

//返回拦截处理
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});


export default async (api,method='get', params) => {
    return new Promise((resolve, reject) => {
        instance[method](api, params)
            .then(res => {
                console.log("结果",res)
                resolve(res.data)
            })
            .catch(error => {
                reject(error)
            })
    })
}