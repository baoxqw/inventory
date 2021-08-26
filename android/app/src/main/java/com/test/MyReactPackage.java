package com.test;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
public class MyReactPackage implements ReactPackage {
    @Override
    public List createNativeModules(ReactApplicationContext reactContext) {
        //返回一个原生列表
       List<NativeModule> modules = new ArrayList<>();
        //加了一个原生模块
        modules.add(new myNativeModule(reactContext));
        return modules;
    }
    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }
    @Override
    public List createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
