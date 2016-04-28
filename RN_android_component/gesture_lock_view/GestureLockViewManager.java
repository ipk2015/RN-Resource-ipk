package com.cm_wealth_app.rn_native_android.native_view.gesture_lock_view;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.List;

/**
 * Created by yunpengfeng on 16/4/14.
 */
public class GestureLockViewManager extends SimpleViewManager<GestureLockView> {
    @Override
    public String getName() {
        return "GestureLockView";
    }

    @Override
    protected GestureLockView createViewInstance(final ThemedReactContext reactContext) {
        final GestureLockView gestureLockView=new GestureLockView(reactContext);
        gestureLockView.setOnPatternListener(new GestureLockView.OnPatternListener() {
            @Override
            public void onPatternStart() {

            }

            @Override
            public void onPatternCleared() {

            }

            @Override
            public void onPatternCellAdded(List<GestureLockView.Cell> pattern) {

            }

            @Override
            public void onPatternDetected(List<GestureLockView.Cell> pattern) {
                StringBuffer sb = new StringBuffer();
                for (GestureLockView.Cell cell : pattern) {
                    sb.append(cell.toPwd());
                }

                WritableMap nativeEvent= Arguments.createMap();
                nativeEvent.putString("gestureValues", sb.toString());
                reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                        gestureLockView.getId(), "topChange",nativeEvent
                );
            }
        });
        return gestureLockView;
    }

    @ReactProp(name="disPlayMode")
    public void setDisPlayMode(GestureLockView view,String disPlayMode){
        if (disPlayMode.contains("Correct")){
            view.setDisplayMode(GestureLockView.DisplayMode.Correct);
        }else if(disPlayMode.contains("Wrong")){
            view.setDisplayMode(GestureLockView.DisplayMode.Wrong);
        }else if(disPlayMode.contains("Animate")){
            view.setDisplayMode(GestureLockView.DisplayMode.Animate);
        }else{

        }
    }

}
