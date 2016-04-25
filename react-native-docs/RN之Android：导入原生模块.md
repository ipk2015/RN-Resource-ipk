前提是用react－native init 工程名 已经初始化好一个可以正常运行的RN工程（检验标准是在手机上可以正常运行）。

下面的步骤是在RN0.17版本的，0.18版本后也是可以的，由于官方进一步封装，具体步骤可能略有不同。

1.导入Android原生模块的步骤
        步骤1.新建java类继承ReactContextBaseJavaModule.
      public class MyToastModule extends ReactContextBaseJavaModule
  必须复写getName方法，return后跟的是JS里要调用的名字（可不同于类名）。
      public String getName() {
        return "MyToastAndroid";
       }
       
   定义要被JS使用的方法，要加上注解@ReactMethod
       @ReactMethod
        public void show(){
            Toast.makeText(getReactApplicationContext(),"hello",Toast.LENGTH_LONG).show();
        }   
        步骤2.新建类实现ReactPackage接口            
            public class MyReactPackage  implements ReactPackage
   有三个方法需要实现：createNativeModeule,createJSModules,createViewManagers.这三个方法都返回list，
   要注意一点是虽然默认返回null，但这样写编译时会出错，要改写成返回空集合，一般写成
       return Collections.emptyList();
   此时需要在createNativeModeule里，返回带有上面module的集合
       @Override
        public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
            return Arrays.<NativeModule>asList(
                    new MyToastModule(reactContext)
            );
        }
        
    步骤3.在MainActivity里（在RN工程里是自动生成的入口activity），添加上面的自定义的ReactPackage
        mReactInstanceManager = ReactInstanceManager.builder()
        。。。。//省略其他代码
        .addPackage(new MainReactPackage())
        .addPackage(new MyReactPackage())
        。。。。／／省略其他代码
        
        注：0.18版本后生成的MainActivity里直接会有个getPackages()方法，
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage()
            );
          }
          直接将上面自定义的MyReactPackage放在集合里就可以了。
    步骤4.在JS里调用刚才的原生模块
        React.NativeModules.MyToastAndroid.show();
  
  2.上面是最简单的一种调用，基本步骤是不变的，接下来是在上面基础上多了点东西的调用。
  
    1.在JS里调用带参数的原生模块里的方法
    将上面的MyToastModule类里的show方法改为
        @ReactMethod
        public void show(String message,int dur){
             Toast.makeText(getReactApplicationContext(),message,dur).show();
        }          
    在JS里调用为
        React.NativeModules.MyToastAndroid.show("hello",1);
        
    2.在JS里调用原生模块里的预设参数
    在MyToastModule的Java类里复写方法getConstants，此方法返回了需要导出给JavaScript使用的常量
        @Override
        public Map<String, Object> getConstants() {    final Map<String, Object> constants = new HashMap<>();
            constants.put("HAHA", Toast.LENGTH_SHORT);
            constants.put("LONG", Toast.LENGTH_LONG);    
            return constants;
        }
     在JS里调用为
         React.NativeModules.MyToastAndroid.show("hellohaha",React.NativeModules.MyToastAndroid.HAHA);
      
     3.将原生模块封装成一个JS模块，以便省下每次都从NativeModules中获取对应模块的步骤，从JS端访问更为方便。
     新建名为MyToastAndroidJS的JS文件，文件里内容为
        'use strict'
        var {NativeModules} = require('react-native');
        module.exports=NativeModules.MyToastAndroid;
     在其他JS代码或文件中可以这样调用，
     var MyToastAndroidLOL = require('./MyToastAndroidJS');//此处确保按文件路径可以被查找到
     MyToastAndroidLOL.show('haha JSModule',MyToastAndroidLOL.HAHA);
     
 3.回调函数
     上面全是JS调用原生模块里的方法，有参或无参，但原生模块只是被调用，没有反馈回来数据，下面是回调使用说明。（此处承接上面的3）
     1.使用Callback回调
     在MyToastAndroid中添加方法showAll。在showAll的参数中的callback是com.facebook.react.bridge.Callback，注意别导错包了。
     
        @ReactMethod
        public void showAll(int a,int b,Callback erroCallBack,Callback successCallback){
            try{
                int c=a/b;
                successCallback.invoke(a,b);
            }catch(Exception e){
                erroCallBack.invoke(e.getMessage());
            }
        }
      在JS中调用showAll方法 
         MyToastAndroidJJ.showAll(
            1,2,
            (msg) => {console.log(msg)},
            (x,y) => {console.log(x+':'+y)}
          );
       运行后logcat上会打印出1:2，
       当是
          MyToastAndroidJJ.showAll(
            1,0,
            (msg) => {console.log(msg)},
            (x,y) => {console.log(x+':'+y)}
          );
        运行后logcat上会打印出 divide by zero等异常信息。
        这样就实现了原生模块向JS传递数据，并且其中有很大的自由度供调用实现。但要注意showAll里的参数个数在被JS调用时是要一一对应的，在MyToastAndroid中定义了几个参数就要在JS中调用时提供几个参数。
        2.使用Promise回调
        在MyToastAndroid中添加方法showB
        @ReactMethod        
        public void showB(int a,int b,Promise promise){
            try{
                int c=a/b;
                promise.resolve(a+b);
            }catch(Exception e){
                promise.reject("test:"+e.getMessage());
            }
        }
      在JS中，声明一个方法
         showBInJS: async function (){
              try{
                var c = await MyToastAndroidJJ.showB(1,2);
                console.log("test:"+c);
              }catch(e){
                console.log(e);
              }
         },
       在JS中调用
       this.showBInJS();
       在log中会打印出 test:3。
       把上面声明中的2改为0，保存然后Reload JS。
       在log中会打印出 test:divide by zero 等异常信息。
       
       上面是返回一个参数，下面是可以返回多个参数的方式（不唯一）
        在MyToastAndroid中改写方法showB
            @ReactMethod
            public void showB(int a,int b,Promise promise){
                try{
                    int c=a/b;
                    WritableMap map = Arguments.createMap();
                    map.putInt("haha",a);
                    map.putInt("hehe",b);
                    promise.resolve(map);
                }catch(Exception e){
                    promise.reject("fyp:"+e.getMessage());
                }
            }
        在JS中改写showBInJS的声明
            showBInJS: async function (){
              try{
                var {haha,hehe} = await MyToastAndroidJJ.showB(1,2);
                console.log("test:"+haha+":"+hehe);
              }catch(e){
                console.log(e);
              }
            },
          调用不变。
         重新react－native run-android,在log里会打印出 test：1:2。










