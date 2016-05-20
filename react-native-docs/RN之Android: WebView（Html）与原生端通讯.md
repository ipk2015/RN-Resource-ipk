 由于RN本身即为利用原生为JS所调用，Web里的大头Html与JS和原生的通讯肯定是逃不过的。另外就是正常商业化的APP里难免要有活动推广的H5页面，会有直接在H5页面里直接调用如分享／页面跳转等的功能需求。

这里所做的实践是在Mac上，编程工具是IDEA和AS，RN版本是0.24.1。windows平台尚未尝试，不过也应该是一样的，因为没有涉及到如编译环境等问题。

RN目前已有官方组件WebView，

官方教程：http://facebook.github.io/react-native/docs/webview.html#content

中文版：    http://reactnative.cn/docs/0.25/webview.html#content

使用示例：https://github.com/facebook/react-native/blob/a80dd9a92a8d7c201972d1a8b2392e9f893147c8/Examples/UIExplorer/WebViewExample.js

开始的前提是已经新建好一个正常的RN工程。
### 复制官方组件WebView。
1. 复制Java代码。
从MainActivity里的getPackages函数里找到MainReactPackage，点进去再找ReactWebViewManager，找到后再点进去，将ReactWebViewManager路径里的webview文件夹下的events和ReactWebViewManager.java的内容复制出来到自己的目录下。我这里将复制过来的命名为MyWebViewManager.java.
 需要修改MyWebViewManager里的REACT_CLASS值，以便区别于官方组件，我这里改为MyWebView.
2.  复制JS代码。
路径为根目录下node_modules/react-native/Libraries/Components/WebView/WebView.android.js，复制文件到自己的目标目录，为便于区别更改文件名称为MyWebView.android.js。
 需要修改此文件里的部分代码以匹配java代码

    `var RCTWebView = requireNativeComponent('RCTWebView', WebView);`

    `var MyWebView = requireNativeComponent('MyWebView', WebView);`

    同时需要把此文件里其他地方的RCTWebView全部改成MyWebView。

做完上面两步，可以试着在RN中用一下自己复制过来的MyWebView，以确保后面的步骤是在正确的前提下修改的，按WebViewExample里方式引用即可。

```
    var MyWebView =require('./MyWebView');//这一步注意确保引用的文件路径是正确的
    
    <MyWebView
       style={{backgroundColor: BGWASH, height: 100,}}
       source={require('./helloworld.html')}
       scalesPageToFit={true}
    />

```

 运行react-native run-android后如果是正常显示的，可进行下面步骤。
  如果有报错误说有Module命名错误，需要你检查下刚才的文件里是否有修改到位。另外如果有提示providesModule这个词的话，需要修改的地方在MyWebView.android.js的开始的注释里，将

`@providesModule WebView`修改为 `@providesModule MyWebView`


###Html调用原生代码。
在android中，WebView可以通过addJavascriptInterface方法添加原生代码为html中的JS调用；同时java又可以用WebView的loadUrl方法调用Html中的定义的JS方法。
在RN中，上面已封装好的组件正是封装的原生WebView，那么实现Html调用原生代码就很容易了。
在MyWebViewManager中的createViewInstance方法中，在return前添加一行代码

` webView.addJavascriptInterface(new JSObject(reactContext,webView),"JavaSObject");`

JSObject的代码为

```
        public class JSObject {
           private ReactContext mReactContext;
           private WebView mWebView;
           public JSObject(ReactContext reactContext,WebView webView){
           mReactContext=reactContext;
           mWebView=webView;
           
        @JavascriptInterface
       public void showToast(String text){
           Toast.makeText(mReactContext,text,Toast.LENGTH_SHORT).show();
       }
    }
```

helloworld.html的代码为

```
<!DOCTYPE html>
<html>
<head>
 <meta chatset="utf-8" />
 <title>This is a test</title>
 <style>
   *{
     margin: 0;
     padding: 0;
   }
   a{
     display: block;
     width: 100px;
     padding: 1em;
     margin: 0 auto;
     font-size: 1em;
     color: #FFF;
     background-color: highlight;
     text-decoration: none;
   }
 </style>
</head>

<body>
<a>js test</a>
<script>

 function funFromjs(){
   document.getElementById("helloweb").innerHTML="HelloWebView,i'm from js";
 }
 var aTag = document.getElementsByTagName('a')[0];
 aTag.addEventListener('click', function(){
   //调用android本地方法
   JavaSObject.showToast('hahahaha');
   return false;
 }, false);
</script>
<p></p>
<div id="helloweb">

</div>
</body>
</html>

```

运行后点击界面上出现的小方块，会有toast弹出的话即说明从Html端调用Java端代码成功了。

###Html与React端的通讯

做完2就可以实现RN中的WebView载入的Html里的js调用java端方法，比较下就知道：这样同在原生android中的WebView与Html的相互调用是完全一样的。但我们毕竟是在RreactNative构建的APP中，更理想的应该是在React端控制所有的东西，也就是说我们需要做到Html中能否调用，如何调用哪些东西应该交由React端直接控制，否则每次Html有不同的调用需求时都需要去更改java代码，不够便捷和统一。

问题再具体化下就是：在Html中发起调用请求时，应该由载入Html的WebView响应这个请求。
那么问题来了，应该如何实现这样的效果？

结合前面我们封装原生View的经验，我们可以为封装出来的组件以@ReactProp添加属性，但直接添加属性恐怕不行：因为属性都是设置了即执行，不会存在接收到响应后才执行的属性。还有什么可以作为组件通讯用呢，那就是事件绑定：事件本身也匹配请求响应这样的特性。

接下来思路就很明确了，Html是WebView通过addJavascriptInterface方法添加原生代码为html中的JS调用，我们需要在这个被添加的java类中添加WebView的事件绑定，同时需要修改相应的React端代码。

这里没有用到新的知识点，只是将前面封装原生View中的步骤重新执行一遍，不懂步骤或者不理解的请参照前面的封装原生UI组件。
接着前面的代码继续，首先是完善JSObject的代码，添加事件绑定

```
public class JSObject {
   private ReactContext mReactContext;
   private WebView mWebView;
   public JSObject(ReactContext reactContext,WebView webView){
       mReactContext=reactContext;
       mWebView=webView;
   }
   @JavascriptInterface
   public void showToast(String text){
       Toast.makeText(mReactContext,text,Toast.LENGTH_SHORT).show();
   }

   @JavascriptInterface
   public void startShare(String json) {
       WritableMap nativeEvent = Arguments.createMap();
       nativeEvent.putString("message", json);
       mReactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
               mWebView.getId(), "topChange", nativeEvent);
   }
}

```
    

再在MyWebView.android.js中添加注册的事件,只写出需更改的地方。


```
var WebView = React.createClass({
...
propTypes: {
    ....
    onShare:React.PropTypes.func,
    .....
}

_onShare(event:Event){
   if(!this.props.onShare){
       return;
   }
   if(event.nativeEvent.message!=null){
       this.props.onShare(event.nativeEvent.message);
       return;
   }
},

render: function() {
     ....
    var webView2 =
       <CMWebView
                ......  
        onChange={this._onShare}
        />;
    ...
}
...
}
```


最后在使用MyWebView时。



```
...
_onShareTest(result){
   alert(result);
},

...
<MyWebView
       style={{backgroundColor: BGWASH, height: 100,}}
       source={require('./helloworld.html')}
       scalesPageToFit={true}
        onShare={(json)=>this._onShareTest(json)}    />

```


之前在helloworld.html中写的    `JavaSObject.showToast('hahahaha');`
就要变成    `JavaSObject.startShare('hahahaha');`
再次运行后点击小方块，这次如果弹出的alert，就说明试验成功了。

回顾一下上面的步骤会发现我们并没有对事件做具体的限制，对调用何种需求也没有具体限制，例如你可以在传递的string里设置一个如type的值来标明html此次调用的类型，后面附上参数。所以说以这样的步骤下来几乎可以满足所有的Html调用本地方法的需求，而由React端来控制。
不过呢，我觉得这样的步骤还是有点麻烦的，看官方的代码也发现WebView还留有很多东西等待完善补充，相信未来官方会把WebView的功能完善的更好更强大的。

最后总结的话就是：WebView（Html）与原生端的通讯只是又实践了一遍之前的封装原生UI组件，没有什么新东西的。
PS：感觉最近升级的0.25.＋版本略坑，bug又开始多了。真希望0.26赶紧来啊。




