/**
 * Created by yunpengfeng on 16/4/14.
 */
/**
 *安卓手势密码:3*3,可以更改背景图片和长宽
 * 从onGestureFinished获得每次输入的手势代表数字
 * 有一个可设置属性为disPlayMode,有三个值可以设置:
 * Correct:会以相关样式显示刚刚输入的手势
 * Wrong:会以相关样式显示刚刚输入的手势
 * Animate:会以动画样式重复刚才输入的手势
 * 考虑到实际使用时的情景,默认值设为Wrong
 * 有6张显示图片在native/android/rn_native_android/src/main/res/drawable-hdpi里
 *使用示例:
 * var GestureLockView = require('./native/android/rn_js_android/view/GestureLockView');
 * _onGestureFinished(values){

        //alert(values);
        if("1365"===values){
            this.setState({
                i:this.state.i+1,
                gestureLockMode:"Correct"+this.state.i,//为了避免设置了state却不刷新的情况出现
            });
        }else{
            this.setState({
                i:this.state.i+1,
                gestureLockMode:"Wrong"+this.state.i,
            });
        }
    }
 *rendreGestureLockView(){
        return(
            <View style={styles.container}>
                <GestureLockView style={styles.gestureLockView}
                                 onGestureFinished={(values)=>this._onGestureFinished(values)}
                                 disPlayMode={this.state.gestureLockMode}/>
            </View>
        );
    }
 *
 *
 *
 */

var {requireNativeComponent,PropTypes}=require('react-native');
var myGestureLockView ={
    name:'GestureLockView',
    propTypes:{
        disPlayMode:PropTypes.string,

        testID:PropTypes.string,
        accessibilityComponentType:PropTypes.string,
        accessibilityLabel:PropTypes.string,
        accessibilityLiveRegion:PropTypes.string,
        renderToHardwareTextureAndroid:PropTypes.bool,
        importantForAccessibility:PropTypes.string,
        onLayout:PropTypes.bool,
    }
}

var RCTMyView =requireNativeComponent('GestureLockView',myGestureLockView);
import React,{
    Component
} from 'react-native';
class RCTGestureLockView extends Component{
    constructor(){
        super();
        this._onChange=this._onChange.bind(this);
    }
    _onChange(event:Event){

        if(!this.props.onGestureFinished){
            return;
        }
        if(event.nativeEvent.gestureValues){
            this.props.onGestureFinished(event.nativeEvent.gestureValues);
            return;
        }
    }
    render(){
        return <RCTMyView
            {...this.props}
            onChange={this._onChange} />
    }
}
RCTGestureLockView.propTypes={
    onGestureFinished:React.PropTypes.func,
}
module.exports =RCTGestureLockView;