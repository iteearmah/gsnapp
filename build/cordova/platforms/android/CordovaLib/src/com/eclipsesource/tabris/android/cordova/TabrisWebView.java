package com.eclipsesource.tabris.android.cordova;

import android.annotation.SuppressLint;

import com.eclipsesource.tabris.android.IMessageSender;
import com.eclipsesource.tabris.android.RemoteObject;
import com.eclipsesource.tabris.android.TabrisActivity;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPreferences;
import org.apache.cordova.CordovaWebViewImpl;
import org.apache.cordova.NativeToJsMessageQueue;
import org.apache.cordova.PluginEntry;
import org.apache.cordova.PluginResult;
import org.apache.cordova.engine.SystemWebView;
import org.apache.cordova.engine.SystemWebViewEngine;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@SuppressLint("ViewConstructor")
class TabrisWebView extends CordovaWebViewImpl {

  static final String CALLBACK_ID = "callbackId";

  private static final String STATUS = "status";
  private static final String MESSAGE = "message";
  private static final String FINISH = "finish";
  private static final String KEEP_CALLBACK = "keepCallback";

  private static ExecutorService executorService = Executors.newFixedThreadPool(10);

  private TabrisActivity activity;
  private Map<String, String> idToTargetMapping = new HashMap<>();
  private NativeToJsMessageQueue nativeToJsMessageQueue;

  TabrisWebView(TabrisActivity activity) {
    super(new SystemWebViewEngine(new SystemWebView(activity)));
    this.activity = activity;
  }

  static ExecutorService getExecutorService() {
    return executorService;
  }

  @Override
  public void init(CordovaInterface cordova, List<PluginEntry> pluginEntries, CordovaPreferences preferences) {
    nativeToJsMessageQueue = new NativeToJsMessageQueue();
    nativeToJsMessageQueue.addBridgeMode(new NativeToJsMessageQueue.NoOpBridgeMode());
    nativeToJsMessageQueue.setBridgeMode(0);
    super.init(cordova, pluginEntries, preferences);
  }

  @Override
  public void sendPluginResult(PluginResult result, String callbackId) {
    String encodedResult = encodeResult(result, callbackId);
    if (encodedResult == null) {
      return;
    }
    boolean keepCallback = result.getKeepCallback();
    int status = result.getStatus();
    Map<String, Object> event = createEvent(callbackId, keepCallback, encodedResult, status);
    RemoteObject remoteObject = activity.getRemoteObject(idToTargetMapping.get(callbackId));
    if (!keepCallback) {
      idToTargetMapping.remove(callbackId);
    }
    if (remoteObject != null) {
      sendResultOnUIThread(remoteObject, event);
    }
  }

  private String encodeResult(PluginResult result, String callbackId) {
    nativeToJsMessageQueue.addPluginResult(result, callbackId);
    return nativeToJsMessageQueue.popAndEncode(false);
  }

  private Map<String, Object> createEvent(String callbackId, boolean keepCallback,
                                          String encodedResult, int status) {
    Map<String, Object> event = new HashMap<>();
    event.put(CALLBACK_ID, callbackId);
    event.put(STATUS, status);
    event.put(KEEP_CALLBACK, keepCallback);
    event.put(MESSAGE, encodedResult);
    return event;
  }

  private void sendResultOnUIThread(final RemoteObject remoteObject, final Map<String, Object> event) {
    activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        remoteObject.notify(FINISH, event);
      }
    });
  }

  void mapCallbackIdToTarget(String callbackId, String target) {
    idToTargetMapping.put(callbackId, target);
  }

  @Override
  public void loadUrl(String url) {
    IMessageSender messageSender = activity.getWidgetToolkit().getMessageSender();
    if (messageSender != null) {
      if (url != null) {
        String trimmedUrl = url.trim();
        if (trimmedUrl.startsWith("javascript:")) {
          String script = trimmedUrl.replaceFirst("javascript:", "");
          messageSender.evaluateScript(script);
        }
      }
    }
  }
}