import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import asyncStorage from '@react-native-async-storage/async-storage';
import { spArr } from '../util/index';

//文件夹不存在创建文件夹
async function isDirectory (name,albumName = "data"){
    try{
        const albumUri  = await FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(albumName);
        const permissions  = await FileSystem.StorageAccessFramework.readDirectoryAsync(albumUri);
        let status = false;
        let obj = {}
        permissions.forEach(item=>{
            const arr = item.split("%2F");
            if(arr[arr.length - 1] === name){
                status = true
                obj = item
            }
        })
        //不存在 blind目录时创建目录
        if(!status){
            await FileSystem.StorageAccessFramework.makeDirectoryAsync(albumUri,name);
        }
    }catch (e) {
        Alert.alert("错误提示","请检查相应的目录")
    }
}

async function getFile(fileName,fileType){
    try{
        //选择文件
        const albumUri  = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!albumUri.granted || !albumUri.directoryUri){
            return false;
        }
        //遍历目录下的文件
        const permissions  = await FileSystem.StorageAccessFramework.readDirectoryAsync(albumUri.directoryUri);
        let uri = null;
        //查找需要的文件
        permissions.forEach(item=>{
            const arr = item.split("%2F");
            if(arr[arr.length - 1] === fileName+fileType){
                uri = item;
            }
        });
        if(!uri){
            Alert.alert("错误提示","未找到可用文件");
            return false;
        }
        const data = await FileSystem.StorageAccessFramework.readAsStringAsync(uri);
        const list = JSON.parse(data);
        if(list&&list.length){
            const dataKey = spArr(list,1000, fileName);
            if(dataKey.keyList.length){
                asyncStorage.setItem(fileName,JSON.stringify(dataKey.keyList));
                dataKey.dataArr.forEach(item =>{
                    asyncStorage.setItem(item.key,JSON.stringify(item.value));
                })
            }
        }

        return true;
    }catch (e) {
        console.log("e",e)
        Alert.alert("错误提示","导入失败")
    }
}

//文件存在获取文件,文件不存在创建文件
async function saveFile(fileName,content,fileType){
    try{
        //选择文件
        const albumUri  = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!albumUri.granted || !albumUri.directoryUri){
            return false;
        }
        //遍历目录下的文件
        const permissions  = await FileSystem.StorageAccessFramework.readDirectoryAsync(albumUri.directoryUri);
        let uri = null;
        //查找需要的文件
        permissions.forEach(item=>{
            const arr = item.split("%2F");
            if(arr[arr.length - 1] === fileName){
                uri = item;
            }
        });
        //文件不存在
        if(!uri){
            const cUri = await FileSystem.StorageAccessFramework.createFileAsync(albumUri.directoryUri,fileName,fileType);
            uri = cUri;
        }else{
            //当文件存在时
            await FileSystem.StorageAccessFramework.deleteAsync(uri)
            await FileSystem.StorageAccessFramework.createFileAsync(albumUri.directoryUri,fileName)
        }
        await FileSystem.StorageAccessFramework.writeAsStringAsync(uri,JSON.stringify(content),{
            encoding: FileSystem.EncodingType.UTF8
        });
        return true;
    }catch (e) {
        Alert.alert("错误提示","请检查相应的文件格式")
    }
}
//将内容放进文件
async function writeFile(uri,content){
    await FileSystem.StorageAccessFramework.writeAsStringAsync(uri,content,{encoding:FileSystem.EncodingType.UTF8});
}



export {
    isDirectory,
    saveFile,
    getFile,
    writeFile
}
