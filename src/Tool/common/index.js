import { unzipFunc } from '../util/index';

//处理离线扫码数据
function chuLiCode(arrList){
    //处理数据
    const totalList = [];

    for (let i = 0; i < arrList.length; i++) {
        totalList.push(arrList[i].value)
    }
    let dataList = [];

    for (let i = 0; i < totalList.length; i++) {
        const str = totalList[i];
        //解码
        const bufferStr = unzipFunc(str);

        const listB = bufferStr.split('$B').filter(item => item !== "");
        const array = [];
        listB.forEach(item => {
            const startB = item.indexOf('$R');//获得字符串的开始位置
            const resultB = item.substring(0, startB);//截取字符串
            let listR = item.split('$R');
            listR = listR.filter(item => item !== resultB);
            const obj = {
                title: '备料计划号',
                value: resultB,
                children: []
            };
            listR.forEach(it => {
                const startR = item.indexOf('$J');//获得字符串的开始位置
                const resultR = item.substring(0, startR);//截取字符串
                let listJ = it.split('$J');
                const first = listJ.shift();
                obj.children.push({
                    title: '入库单号+图号',
                    value: first,
                    inbound: first.split(",")[0],
                    drawing: first.split(",")[1],
                    children: listJ.map(item => {
                        return {
                            title: '产品+任务',
                            value: item,
                            product: item.split(",")[0],
                            taskId: item.split(",")[1]
                        }
                    })
                })
            });
            array.push(obj);
        })
        dataList = [...dataList, ...array];
    }

    return dataList;
}


export {
    chuLiCode
}
