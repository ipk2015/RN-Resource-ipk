基于[官方文档](http://reactnative.cn/docs/embedded-app-android.html#content)

由于官方文档语焉不详，一些详细步骤没有配置好的话很容易植入失败，这里工具是AS，我是在Mac上做的，，尝试并且最终成功了。
React植入原生应用步骤：（注意是Mac上的，windows尚未尝试）

    步骤1:  植入前提
        一个已有的、基于gradle构建的Android应用
         Node.js，参见官方文档了解相关的设置操作。（环境是否配置好的检验标准是能否成功初始化一个RN工程并运行在手机上）

    步骤2: 在App里添加依赖和权限      
        在App里的build.gradle文件中（不是project目录下那个build.gradle），添加React Native依赖：
        compile 'com.facebook.react:react-native:0.18.+'
          尽量选择React Native库的最新稳定版本。
          然后，在AndroidManifest.xml里增加Internet访问权限：
       <uses-permission android:name="android.permission.INTERNET" />
       
    步骤3: 添加原生代码，即以React为View的Activity
     官方文档目前是0.18版本以前的，我这里按照0.18版本的（基本一样的，只是官方又进一步封装给我们用）
     新建MyReactActivity,继承ReactActivity，代码如下。
     只有三个抽象方法需要实现，默认是返回null，需要修改。
     public class MyReactActivity  extends ReactActivity{
        @Override
        protected String getMainComponentName() {
            return "myreactactivity";  //注册的react组件名，一会在JS里要用到
        }

        @Override
        protected boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG; // Debug模式，这个模式才能在JS里作调试
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage()
            );  //返回带有官方已有的package的集合
        }
      }
      
     由于是Activity，需要建立完毕后在AndroidManifest.xml里注册。
     此外，也要注册另外一个开发菜单Activity（官方API），否则不能调出开发设置界面
     <activity android:name=".MyReactActivity"
          android:screenOrientation="portrait"
          android:configChanges="keyboard|keyboardHidden|orientation|screenSize" />
     <activity android:name="com.facebook.react.devsupport.DevSettingsActivity" />
     
    步骤4: 添加React环境
     打开控制台，在当前工程根目录里执行（AS直接点击下面的控制台就可以）
         npm init
      会有提示，说执行 npm help json可以查看下面具体属性的定义 和npm install <pkg> --save可以生成包。
      注意：就算有需要，也不要马上输入这两个命令来做，输了也不会有作用，因为下面已经开始要你输入name属性了。
     然后会要求依次输入name,version,description,main,test command,author,license等属性。
     这是要生成的package.json里的内容。具体该怎么填写，建议control + C 退出当前命令后执行 npm help json，
     然后把这个帮助说明文档一点点全部复制下来（不大），大致看看注意要点，后面填写时不明白的就查查看。
     需要提示一点是这些属性有的不能随便写，否则构建不成功。
     我的那些属性最终如下，有些是根据自己的React模块填写的，有的是根据刚才那个帮助文档填写的。
     
           {
               "name": "myreactactivity",
               "version": "0.0.1", 
               "description": "this is the package.json",
               "main": "index.js",
               "scripts": {
               "start": "node_modules/react-native/packager/packager.sh" //这个是后面添加的
                },
               "repository": {
                    "type": "git",
                    "url": "git+https://github.com/npm/npm.git"
                 },
               "author": "patrick",
               "license": "ISC",
               "bugs": {
                    "url": "https://github.com/npm/npm/issues"
                },
               "homepage": "https://github.com/npm/npm#readme",
               "dependencies": {
               "react-native": "^0.18.1"
                }
            }
       然后再在控制台里执行
           npm install --save react-native
        会下载nodejs和RN等的依赖。
        执行完以后控制台应该不会出现WARN信息，若出现的话很可能就是构建不成功（可以继续往下操作步骤，不行的话就是这一步没成功），
        若的确构建不成功，很大可能是上面的package.json的有些属性填写不正确。需要重新npm init。
        继续在控制台执行
        curl -o .flowconfig https://raw.githubusercontent.com/facebook/react-native/master/.flowconfig
       现在打开新创建的package.json文件然后在scripts字段下添加如下内容：
        "start": "node_modules/react-native/packager/packager.sh" // 我的上面已经有的就是在这一步添加的
        
    步骤5: 添加JS代码
        在project目录下（也就是package.json所在目录）新建名为index.android.js的JS文件，在里面拷贝如下内容
       'use strict';
        var React = require('react-native');
        var {
          Text,
          View
        } = React;
        
        class myreactactivity extends React.Component {
          render() {
            return (
              <View style={styles.container}>
                <Text style={styles.hello}>Hello, World</Text>
              </View>
            )
          }
        }
        var styles = React.StyleSheet.create({
          container: {
            flex: 1,
            justifyContent: 'center',
          },
          hello: {
            fontSize: 20,
            textAlign: 'center',
            margin: 10,
          },
        });
        
        React.AppRegistry.registerComponent('myreactactivity', () => myreactactivity);
        这就是个JS文件，会ReactJS的可以随便写了，只要引入的组件名对的上就好。
        
    步骤6: 添加安卓关联代码
       上面的新建的MyReactActivity可以设置为入口activity，也可以设置为普通activity。
       如果打算设置为入口activity的话，就在清单文件里自己配置就可以，不需要额外代码；
       如果打算设置为普通acitivity,就按正常原生activity一样配置和用代码启动就好。
       总结一句话就是：启动和加载这个MyReactActivity按照原生Activity一样配置和加载就好。
       
    步骤7: 运行应用
       先在工程目录下启动JS服务器，在控制台运行
           npm start
       然后启动APP，用AS的正常Run就可以。
       第一次到MyReactActivity界面肯定是红屏，需要摇出开发菜单设置IP和端口，然后Reload JS就行。
       正常情况下现在可以看到Hello World了。
       如果还是红屏的话就需要看看显示的错误是啥并且针对修改了。
       PS：用Mac的话有个找原因的小窍门，打开Xcode（没有的话需要下载，免费的），在手机上运行RN时，出错的信息可以在Xcode上看到具体的错误信息。这在解决一些红屏问题时很有用。


        
