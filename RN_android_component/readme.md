####本文件夹下主要是自己封装的安卓原生功能模块和UI组件.
目前包含有
#####原生模块：

1.常用功能模块

#####原生UI组件：

1.手势密码



考虑到这些文件在使用时嵌入很方便，同时我也不想上传那些每个工程都自带的文件，这里没有以一个RN工程的形式呈现，而是将每个模块或组件涉及到的文件单独拿出来。自己在使用时需要按官方教程那样集成进去，这个过程非常简单。下面做下简单说明：

1.Java端这边，需要先把对应模块或组件的java文件放好位置，可能修改的地方应该有package.

2.创建对应的ReactPackage类，将1中放好的模块或组件类加入进去。需要注意的是模块和组件两种加进去的方法是不一样的。如下所示

```
@Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(
                new MyToastAndroid(reactContext),
                new TestNativeOut(reactContext)
        );
    }


    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList(
                new PieChartViewManager(),
                new MyTextViewManager(),
                new GestureLockViewManager()
        );
    }
```

3.将2中的ReactPackage放到自动生成的MainActivity中，如下
```
@Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
                new MyReactPackage()
        );
    }
```

4.Java端做完，开始做JS端的：将对应的模块或组件的JS文件放好，然后在用的时候直接引用就可以了。需要注意的是引入文件时确保文件位置是正确的。每个模块或组件的JS文件里有示例用法供参考。

