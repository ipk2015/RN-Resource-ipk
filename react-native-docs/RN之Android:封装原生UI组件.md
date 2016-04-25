参考[官方文档](http://facebook.github.io/react-native/docs/native-components-android.html#content),[中文版](http://reactnative.cn/docs/0.23/native-component-android.html#content)

官方文档以ImageView为样例，这里以android原生最常见的TextView的做一下简单封装示例，官方组件中已有关于原生TextView的更完整的封装，需要的可以去看。

    这里封装的前提是已经有一个可以正常运行的RN工程。
    建议添加Java代码时用AS来打开android工程，添加JS代码时用IDEA。这样都会有智能提示，比较方便。
    
####封装Android原生视图的基本步骤：
```
1.创建一个ViewManager的子类，并实现必需方法。
2.创建自己的ReactPackage,并将1中创建的ViewManager的子类添加到其中；再将自己的ReactPackage添加到工程里的ReactActivity。
3.在1中创建的ViewManager子类中导出视图的属性设置器：使用@ReactProp（或@ReactPropGroup）注解。
4.实现JS模块。
5.在JS里使用封装的原生UI。
6.注册原生事件
```
下面为每一步作详细解释并辅以代码。

1.创建一个ViewManager的子类，并实现必需方法。
```
public class MyTextViewManager extends SimpleViewManager<TextView> {
    @Override
    public String getName() {
        return "MyTextView";
    }
    @Override
    protected TextView createViewInstance(ThemedReactContext reactContext) {
        TextView textView = new TextView(reactContext);
        return textView;
}
```

必需的方法为getName和createViewInstance两个方法。看名字就知道一个是返回创建的view名字，一个是创建view实例。
这里选择的是SimpleViewManager,还有个BaseViewManager.两者的区别就类似我们在android中经常用的SimpleAdapter和BaseAdapter一样。

2.逐步注册ViewManger。
先创建自己的ReactPackage,并将1中创建的ViewManager的子类添加到其中。
```
public class MyReactPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(
                new MyToastAndroid(reactContext)
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
                new MyTextViewManager()
        );
    }
}
```

当实现ReactPackage时，需要实现这三个方法，学过前面的的导入原生模块部分的同学应该很熟悉了。封装的原生模块放在createNativeModules里，如上面的MyToastAndroid; 封装的原生UI组件放在createViewManagers里。需要注意的是剩下的最后一个方法createJSModules里默认是返回null，要改成返回空集合，否则编译时会报错。
    然后将MyReactPackage添加到ReactActivity中
```    
public class MainActivity extends ReactActivity {
    @Override
    protected String getMainComponentName() {
        return "RN0405";
    }
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }
    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
                new MyReactPackage()
        );
    }
}
```
这个MainActivity是init RN工程时自动生成的。将上面的MyReactPackage添加到getPackages方法里即可。

3.在MyTextViewManager中添加需要导出的view属性。
```
public class MyTextViewManager extends SimpleViewManager<TextView> {
    @Override
    public String getName() {
        return "MyTextView";
    }
    @Override
    protected TextView createViewInstance(ThemedReactContext reactContext) {
        TextView textView = new TextView(reactContext);
        return textView;
    }
    @ReactProp(name="text")
    public void setText(TextView view,String text){
        view.setText(text);
    }
    @ReactProp(name="textSize")
    public void setTextSize(TextView view,float fontSize){
        view.setTextSize(fontSize);
    }
    @ReactProp(name="textColor",defaultInt = Color.BLACK)
    public void setTextColor(TextView view,int textColor){
        view.setTextColor(textColor);
    }
    @ReactProp(name="isAlpha",defaultBoolean = false)
    public void setTextAlpha(TextView view,boolean isAlpha){
        if(isAlpha){
            view.setAlpha(0.5f);
        }else{
            view.setAlpha(1.0f);
        }
    }
}
```

官方文档里说的很清楚，也强调了注意事项，在此不赘述，摘录如下：

要导出给JavaScript使用的属性，需要申明带有@ReactProp（或@ReactPropGroup）注解的设置方法。方法的第一个参数是要修改属性的视图实例，第二个参数是要设置的属性值。方法的返回值类型必须为void，而且访问控制必须被声明为public。JavaScript所得知的属性类型会由该方法第二个参数的类型来自动决定。支持的类型有：boolean, int, float, double, String, Boolean, Integer, ReadableArray, ReadableMap。

@ReactProp注解必须包含一个字符串类型的参数name。这个参数指定了对应属性在JavaScript端的名字。

除了name，@ReactProp注解还接受这些可选的参数：defaultBoolean, defaultInt, defaultFloat。这些参数必须是对应的基础类型的值（也就是boolean, int, float），这些值会被传递给setter方法，以免JavaScript端某些情况下在组件中移除了对应的属性。注意这个"默认"值只对基本类型生效，对于其他的类型而言，当对应的属性删除时，null会作为默认值提供给方法。

使用@ReactPropGroup来注解的设置方法和@ReactProp不同。请参见@ReactPropGroup注解类源代码中的文档来获取更多详情。

重要！ 在ReactJS里，修改一个属性会引发一次对设置方法的调用。有一种修改情况是，移除掉之前设置的属性。在这种情况下设置方法也一样会被调用，并且“默认”值会被作为参数提供（对于基础类型来说可以通过defaultBoolean、defaultFloat等@ReactProp的属性提供，而对于复杂类型来说参数则会设置为null）

这里注意一点是关于view的基本属性，如长宽是不需要在此导出的。至于需要导出哪些属性是要根据要封装的原生view的实际情况来做决定的，如果不知道如何导某些类型的属性，建议去看看官方已经封装好的原生组件（在MainReactPackage里可以看到官方已经封装了的原生组件）。
    至此，java端算是做好了。
    
4.实现对应的JS模块。
    创建MyTextView.js 文件，里面初始的代码如下
```
var {requireNativeComponent,PropTypes}=require('react-native');
var myTextView ={
    name:'MyTextViewLOL',
    propTypes:{
        text:PropTypes.string,
        textSize:PropTypes.number,
        textColor:PropTypes.number,
        isAlpha:PropTypes.bool,
    }
}
module.exports =requireNativeComponent('MyTextView',myTextView);
```

第一行代码是引入两个模块，在ES6里的写法是用import代替的。
第二行的myTextView 是定义了myTextView对象，里面用propTypes预定义了我们刚才在MyTextViewManager里导出的四个属性。
最后一行代码是这个JS文件导出的模块，requireNativeComponent的第一个参数是刚才在MyTextViewManager的getName的返回值，第二个参数就是上面我们定义的myTextView，这样就将native端和JS端的两个对象绑定在一起了。

5.在JS里使用封装的原生UI。
```
    index.android.js
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
    Dimensions
} from 'react-native';
const dimensions = Dimensions.get('window');
var MyTextView = require('./MyTextView');
class RN0405 extends Component {
    constructor(){
        super();
        this.state={
            text:"hahahahahaghahaha"
        }
    }
  render() {
    return (
        <View style={styles.container}>
            <View style={styles.outView}>
            <MyTextView
                style={styles.myTextView}
                text={this.state.text}
                textSize={15}
                isAlpha={false}
            />
            </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width:dimensions.width,
      alignItems:'center',
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
    outView:{
        borderWidth:1,
    },
    myTextView:{
        width:300,
        height:100,
    },
});
AppRegistry.registerComponent('RN0405', () => RN0405);
```

其实主要代码没几行，主要是

```
var MyTextView = require('./MyTextView');
<MyTextView
                style={styles.myTextView}
                text={this.state.text}
                textSize={15}
                isAlpha={false}
            />
```

要注意的是在styles.myTextView记得设置宽高，否则就算其他做对了，但也不会显示。

到这里所有步骤走完一遍了，来react－native run-android一下吧。（这里是在Mac上，windows上要先react-antive start）

等运行完了会发现是红屏错误（没有设置的IP和端口的自己去设置好），提示是没有预定义testID，这里就要回到步骤4了：刚才只是把我们在MyTextViewManager导出的四个属性预定义了，然而现在看起来还不够，还有一些view的默认存在属性是需要在JS端也预定义的。本着哪里出错改哪里的解决思路，把testID添加上，再运行，接着还提示有属性没添加，那就继续添加吧。等到哪一次运行不提示还有属性没添加的时候就算添加完了。完整的步骤4文件是这样的。
```
var {requireNativeComponent,PropTypes}=require('react-native');
var myTextView ={
    name:'MyTextViewLOL',
    propTypes:{
        text:PropTypes.string,
        textSize:PropTypes.number,
        textColor:PropTypes.number,
        isAlpha:PropTypes.bool,
        testID:PropTypes.string,
        accessibilityComponentType:PropTypes.string,
        accessibilityLabel:PropTypes.string,
        accessibilityLiveRegion:PropTypes.string,
        renderToHardwareTextureAndroid:PropTypes.bool,
        importantForAccessibility:PropTypes.string,
        onLayout:PropTypes.bool,
    }
}
module.exports =requireNativeComponent('MyTextView',myTextView);
```

6.注册原生事件.

到现在，已经基本可以看到将一个原生View封装成RN的view并且可以以组件形式正常使用了，如果你的需求只是在界面上展示这样一个view，甚至可以有点击等触发功能，那么可以满足了。但是如果想产生native端和JS端的互动，亦即原生事件和JS端事件相互绑定和触发，那么还需要进行注册事件，这样也才能形成两端完整的互动。
    首先在native端进行事件注册。
    
    在MyTextViewManager中，修改createViewInstance方法。
```
@Override
    protected TextView createViewInstance(final ThemedReactContext reactContext) {
        final TextView textView = new TextView(reactContext);
        textView.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                if(event.getAction()==MotionEvent.ACTION_DOWN){
                    WritableMap nativeEvent= Arguments.createMap();
                    nativeEvent.putString("message", "MyMessage");
                    reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                            textView.getId(), "topChange",nativeEvent
                    );
                    return true;
                }else{
                    return false;
                }
            }
        });
        return textView;
    }
```

这是在创建的view实例中，当发生本地事件时进行事件注册。这个事件名topChange在JavaScript端映射到onChange回调属性上，这个映射关系是固定的被官方写在UIManagerModuleConstants.java文件里了，当自己有其他事件需求时需要去这个类里查询。

这里关键是要理解有RCTEventEmitter的这行代码，并且要写对地方。有些同学参考官方文档没有搞出来，应该就是没有把这行代码写在本地事件发生的时候，例如上面的onTouch里。emitter的中文意思是发出者，发射体。

然后就是JS端的事件绑定了。

修改上面的MyTextView.js文件，完整代码如下

```
var {requireNativeComponent,PropTypes}=require('react-native');
var myTextView ={
    name:'MyTextViewLOL',
    propTypes:{
        text:PropTypes.string,
        textSize:PropTypes.number,
        textColor:PropTypes.number,
        isAlpha:PropTypes.bool,
        testID:PropTypes.string,
        accessibilityComponentType:PropTypes.string,
        accessibilityLabel:PropTypes.string,
        accessibilityLiveRegion:PropTypes.string,
        renderToHardwareTextureAndroid:PropTypes.bool,
        importantForAccessibility:PropTypes.string,
        onLayout:PropTypes.bool,
    }
}
var RCTMyView=requireNativeComponent('MyTextView',myTextView);
import React,{
    Component
} from 'react-native';
class MyView extends Component{
    constructor(){
        super();
        this._onChange=this._onChange.bind(this);
    }
    _onChange(event:Event){
        if(!this.props.onChangeMessage){
            return;
        }
        if(event.nativeEvent.message==='MyMessage'){
            this.props.onChangeMessage();
            return;
        }
    }
    render(){
        return <RCTMyView
            {...this.props}
            onChange={this._onChange} />
    }
}
MyView.propTypes={
    onChangeMessage:React.PropTypes.func,
}
module.exports =MyView;
```
这里用MyView对myTextView进行了一次封装。注意到在MyView里为onChange绑定了_onChange方法，在这个方法里我们会调用一个预定义为函数的onChangeMessage。而之前已经在native端将topChange绑定了原生的onTouch事件，topChange又会映射到JS端的onChange属性，这样最后当原生的onTouch事件发生时，就会调用JS端定义的onChangeMessage函数，就实现了两端事件的互动。其实onTouch事件对应到onChange属性后就已经实现了事件绑定，写onChangeMessage是为了示例展示而已。

这里提一下上面的event.nativeEvent.message==='MyMessage'

这一对是在MyTextViewManger里写的，在练习的时候发现当WritableMap里K 为"type"，v随意时，这里用 event.type==='MyMessage' 也可以，但用其他诸如message时就不可以。知道为啥的同学可以告诉下我。
    最后在JS里使用已经封装好的View。
    
    只需为上面的index.android.js文件添加几行代码即可。
    
    在RNWIN0410里添加一个函数
```
_onButtonPress(){
        alert("haha");
        this.setState({
            text:"bind event successful!"
        });
    }
为<MyTextView />添加一个属性onChangeMessage={()=>this._onButtonPress()}
```

好了，重新react-native run-android，看到haha后点击下应该就会出现弹窗和发生文字更改了。

上面就是我参考官方文档实现的封装原生组件过程，还是比较简单的，限于经验有限，若有错误还望指点。还是鼓励大家多去看官方文档和组件代码，会学到很多东西，至于有时模仿官方代码反而错误百出的时候要注意官方的封装是系统的层层封装，不像这个示例一样只是一个类而已。

最近RN版本更新到0.23.1了，发现对windows的兼容性好很多了。在家里在windows10下试着init了下发现竟然成功了！我这是前几个月时按官方教程一步步来配置的环境，只是当时一直出问题就放弃了。现在竟然创建工程成功了，并且可以正常跑在我的锤子上了！

这是不是说明RN的1.0正式版本就快要推出了呢







