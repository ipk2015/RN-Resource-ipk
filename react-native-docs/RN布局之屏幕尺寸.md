在RN中有  Dimensions 模块，可以获取设备长宽信息。

```

static screenWidth()
{
   return Dimensions.get('window').width;
}
static screenHeight()
{
   return Dimensions.get('window').height;
}

```

screenWidth是屏幕宽度，一般使用时不会有有什么问题。但屏幕高度这里有需要注意的地方。

是否显示状态栏，状态栏在各个版本里的高度，布局从何开始都是要考虑。

由于绝大多数正常应用是显示标题栏的，下面讨论的也主要是这种情况。关于不显示标题栏的，在两个平台里都是可以设置的，布局起来考虑也相对简单多了，此处便不做讨论了。

1.  在ios里，屏幕高度是包括状态栏的，布局也是从屏幕顶端开始的，也就是说包括状态栏在内的。

    所以在布局时要考虑状态栏的高度，现在一般认为设状态栏高度为20.

2.1 在Android里，有window和screen两种高度，但这是在14-17版本才会有，17版本以后两者是相同的，14版本以前的RN都不支持也就不用考虑了。问题是现在按市场上手机版本统计情况来看，4.4（19）之前的占比已经很小到可以不考虑了。所以可以认为我们目前关心的这两种高度是统一的了。

如果非要去做识别的话，下面是获取screen尺寸的方法，要注意的是整个方法在iOS平台是没有的，只能在Android平台上运行，要记得做判断。

```

const dimensions1 = Dimensions.get('screen');

```

2.2 Android里的屏幕高度也是包含标题栏的，关键是Android里如果显示标题栏的话，布局是从标题栏下边缘开始的。那么此时如果需要精确布局的话，我们就需要获取到状态栏的高度了。

```

const StatusBarManager = require('NativeModules').StatusBarManager;

var statusBarHeight = StatusBarManager.HEIGHT;

```

用上面的deviceHeight减去这个statusBarHeight就得到可布局区域的高度了。

需要注意的是这个值只在Android平台上有，在iOS上是没有的。

3. 上面可以满足精确化布局的要求了，但在布局要求不是那么精确，布局条件还比较宽松的情况时，可以在最外层容器直接用flex:1来达到填充整个可布局区域的目的。

4. 需要改变状态栏时可使用官方组件StatusBar.

