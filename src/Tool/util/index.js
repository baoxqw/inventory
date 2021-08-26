import pako from "pako";
const Buffer = require('buffer').Buffer;
import {atob} from "js-base64";

function dateUtils(dateTime, format) {
    const date = new Date(dateTime)
    let fmt = format || 'yyyy-MM-dd'
    const o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds()
    }
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length))
    for (const k in o) {
        if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)))
    }
    return fmt
}

function spArr(arr, num, fileName) { //arr是你要分割的数组，num是以几个为一组
    let newArr = [] //首先创建一个新的空数组。用来存放分割好的数组
    let dataArr = [];
    let keyList = [];
    for (let i = 0; i < arr.length;) { //注意：这里与for循环不太一样的是，没有i++
        newArr.push(arr.slice(i, i += num));
    }
    newArr.forEach((item, index) => {
        dataArr.push({
            key: fileName + index,
            value: item
        })
        keyList.push(fileName + index)
    })
    return {
        dataArr,
        keyList
    }
}

function findElem(array, key, val) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][key] === val) {
            return i;
        }
    }
    return -1;
}

function groupBy(array, f) {
    const groups = {};
    array.forEach(function (o) { //注意这里必须是forEach 大写
        const group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}

//数组对象分组
const groupFunc = (list, groupId) => {
    let sorted = groupBy(list, function (item) {
        return [item[groupId]];
    });
    return sorted;
}

//数组对象排序
function compare(p) { //这是比较函数
    return function (m, n) {
        let a = m[p];
        let b = n[p];
        return a - b; //升序
    }
}

// 压缩
function zipFunc(str) {
    //escape(str)  --->压缩前编码，防止中午乱码
    const binaryString = pako.gzip(escape(str), { to: 'string' });
    return btoa(binaryString);
}
// 解压
function unzipFunc(data) {
    let charData = atob(data).split('').map(function (x) { return x.charCodeAt(0); });
    let binData = new Uint8Array(charData);
    return pako.inflate(binData,{to: 'string'});
}


export {
    dateUtils,
    spArr,
    findElem,
    groupFunc,
    compare,
    unzipFunc,
    zipFunc
}
