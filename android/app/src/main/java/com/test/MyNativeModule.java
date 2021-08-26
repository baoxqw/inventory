package com.test;

import android.content.Context;
import android.widget.Toast;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class MyNativeModule extends ReactContextBaseJavaModule {
    private Context mContext;//上下文

    public MyNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @Override
    public String getName() {
        //这个名字是rn通过这个名字用来调用该类的方法
        return "MyNativeMethod";
    }

    //函数不能有返回值 因为被调用的 原生代码是异步的 原生代码执行结束后只能通过回调函数或发消息传给js文件
    @ReactMethod
    public void show(String msg) {
        Toast.makeText(mContext, msg, Toast.LENGTH_SHORT).show();
        //弹出吐司 打印msg
    }
}
