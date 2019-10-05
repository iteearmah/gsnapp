/**
 * ****************************************************************************
 * Copyright (c) Thieme Compliance GmbH
 * *****************************************************************************
 */

package com.eclipsesource.tabris.android.cordova;

import android.content.Intent;
import android.os.Looper;
import android.view.View;

import com.eclipsesource.tabris.android.AbstractOperator;
import com.eclipsesource.tabris.android.Properties;
import com.eclipsesource.tabris.android.RemoteObject;
import com.eclipsesource.tabris.android.TabrisActivity;
import com.eclipsesource.tabris.android.internal.toolkit.AppState;
import com.eclipsesource.tabris.android.internal.toolkit.IAppStateListener;

import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaPreferences;

public class CordovaPluginOperator extends AbstractOperator<String> {

  private static final String TYPE = "cordova.plugin";
  private static final String ACTION = "action";
  private static final String ARGUMENTS = "arguments";
  private static final String SERVICE = "service";

  private final TabrisActivity activity;
  private TabrisWebView webView;

  @Override
  public String getType() {
    return TYPE;
  }

  public CordovaPluginOperator(TabrisActivity activity) {
    this.activity = activity;
    webView = createWebView(activity);
    activity.getWidgetToolkit().addAppStateListener(new CordovaAppStateListener());
  }

  private TabrisWebView createWebView(TabrisActivity activity) {
    TabrisWebView webView = new TabrisWebView(activity);
    CordovaInterfaceImpl cordovaInterface = new CordovaInterfaceImpl(activity, TabrisWebView.getExecutorService());
    ConfigXmlParser configXmlParser = new ConfigXmlParser();
    configXmlParser.parse(activity);
    webView.init(cordovaInterface, configXmlParser.getPluginEntries(), new CordovaPreferences());
    activity.getRootLayout().addView(webView.getView(), 0);
    webView.getView().setVisibility(View.GONE);
    return webView;
  }

  @Override
  public String create(String id, Properties properties) {
    return properties.getString(SERVICE);
  }

  @Override
  public Object call(String service, String method, Properties properties) {
    String action = properties.getString(ACTION);
    String callbackId = properties.getString(TabrisWebView.CALLBACK_ID);
    String arguments = properties.getString(ARGUMENTS);
    RemoteObject remoteObject = activity.getWidgetToolkit().getObjectRegistry().getRemoteObjectForObject(service);
    webView.mapCallbackIdToTarget(callbackId, remoteObject.getId());
    exec(service, action, callbackId, arguments);
    return null;
  }

  private void exec(final String service, final String action, final String callbackId, final String args) {
    TabrisWebView.getExecutorService().execute(new Runnable() {
      @Override
      public void run() {
        if (Looper.myLooper() == null) {
          Looper.prepare();
        }
        webView.getPluginManager().exec(service, action, callbackId, args);
      }
    });
  }

  @Override
  public void destroy(String service) {
    destroyCordovaWebView();
  }

  private void destroyCordovaWebView() {
    if (webView != null) {
      webView.handleDestroy();
      webView = null;
    }
  }

  private class CordovaAppStateListener implements IAppStateListener {

    @Override
    public void stateChanged(AppState state, Intent intent) {
      if (state == AppState.NEW_INTENT) {
        webView.onNewIntent(intent);
      } else if (state == AppState.START) {
        webView.handleStart();
      } else if (state == AppState.RESUME) {
        webView.handleResume(true);
      } else if (state == AppState.PAUSE) {
        webView.handlePause(true);
      } else if (state == AppState.STOP) {
        webView.handleStop();
      } else if (state == AppState.CONFIGURATION) {
        webView.getPluginManager().onConfigurationChanged(null);
      } else if (state == AppState.DESTROY) {
        destroyCordovaWebView();
      }
    }
  }

}