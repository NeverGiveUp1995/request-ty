import queryString from 'query-to-string'

/**
 * 传入一个配置对象（包含：请求地址、请求方式、查询参数对象(params)、请求参数对象(data)、）
 *      注意：这种形参定义方式，使用了形参默认初始化、以及解构赋值两个点，
 *              之所以给配置对象默认值为空对象，是为了防止外部调用的时候没有传配置对象，导致在结构的时候空指针
 * @param url:请求地址
 * @param method：请求方式
 * @param params：查询参数
 * @param data：请求参数
 * @param contentType
 */
export default function ({url, method = 'get', params, data, contentType = 'application/json;charset=utf-8'} = {}) {
    if (method.toLowerCase() === 'get' && !params && data) {
        console.warn(`请求地址：${url}\n检测到请求方式为get，但是params参数不存在，且data参数存在；如果你期望将您提供的参数：${JSON.stringify(data)}\t作为该请求的参数传递，请将字段名修改为params，如果不是请忽略\n${new Error().stack}`)
    } else if (method.toLowerCase() === 'post' && params && !data) {
        console.warn(`请求地址：${url}\n检测到请求方式为get，但是params参数存在，而data参数不存在；如果你期望将您提供的参数：${JSON.stringify(params)}\t作为该请求的参数传递，请将字段名修改为data，如果不是请忽略\n${new Error().stack}`)
    }
    //返回一个Promise对象
    return new Promise((resolve, reject) => {
        //0. 处理url,如果url中带了查询参数，则请求方式直接认为是get方式,并且如果另有查询参数也一并添加到url后
        if (url.match(/\?/)) {
            method = 'GET'
            if (params) {
                url += `&${queryString.stringify(params)}`
            }
        } else {
            if (params && method.toUpperCase() === 'GET') {
                url += `?${queryString.stringify(params)}`
            }
        }
        //处理contentType,如果传入的值没有;charset=utf-8，则自动添加;charset=utf-8，
        contentType = /;charset=utf\-8/g.test(contentType.toLowerCase())
            ? contentType
            : contentType += ';charset=utf-8'

        //1.创建XmlHttpRequest对象，用于发送Ajax请求
        let xhr = new XMLHttpRequest()

        //2. 绑定readyStatus状态值变化的监听
        xhr.onreadystatechange = () => {
            //如果状态值为4（请求完成）
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const {status, responseText, statusText} = xhr
                    //请求成功，修改resolve状态，并且封装response
                    let response = {
                        data: JSON.parse(responseText),
                        status,
                        message: statusText
                    }
                    resolve(response)
                } else {
                    //请求失败，修改reject状态，并且将状态值传出去
                    reject({status: xhr.status, message: xhr.statusText})
                }
            }
        }
        //3. 初始化请求
        xhr.open(method, url, true)
        //4. 发送请求
        switch (method.toUpperCase()) {
            // case  "GET"||"DELETE":
            case "GET":
            case  "DELETE":
                xhr.send()
                break
            // case  "POST"||"PUT":
            case  "POST":
            case  "PUT":
                //设置请求头Content-Type(默认为json)
                xhr.setRequestHeader('Content-Type', contentType)
                //如果传入的contentType 为 application/json 或者  application/json;charset=utf-8
                if (/^(application\/json)(;charset=utf\-8)$/g.test(contentType)) {
                    data = JSON.stringify(data) || undefined
                    xhr.send(data)
                }
                //如果传入的contentType 为 application/x-www-form-urlencoded 或者  application/x-www-form-urlencoded;charset=utf-8
                if (/^(application\/x-www-form-urlencoded)(;charset=utf\-8)$/g.test(contentType)) {
                    data = queryString.stringify(data)
                    xhr.send(data)
                }
        }
    })
}

