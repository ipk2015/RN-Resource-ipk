

import android.view.KeyEvent;
import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


public class CommonFunctionModule extends ReactContextBaseJavaModule{
    public CommonFunctionModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CommonFunctionModule";
    }
    @ReactMethod
    public void showDevMenu(){
        getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                ((ReactActivity)getCurrentActivity()).onKeyUp(KeyEvent.KEYCODE_MENU,null);
            }
        });
    }

}
