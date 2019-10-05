/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.ghanasoccernet;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.content.LocalBroadcastManager;
import android.text.TextUtils;

import com.eclipsesource.tabris.android.TabrisActivity;
import com.eclipsesource.tabris.android.internal.javascript.JavaScriptApp;
import com.eclipsesource.tabris.js.launcher.utils.LoadRequest;
import com.eclipsesource.tabris.js.launcher.utils.loader.DownloadService;
import com.eclipsesource.tabris.js.launcher.utils.loader.AssetBootLoader;
import com.eclipsesource.tabris.js.launcher.utils.view.LoadingIndicator;

import org.apache.cordova.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import static java.util.Arrays.asList;

import static com.eclipsesource.tabris.android.TabrisActivity.RESULT_EXTRA_URL;

public class MainActivity extends CordovaActivity {

  private static final String URI_ANDROID_ASSET = "file:///android_asset/";
  private static final String PREF_RECENTLY_LAUNCHED_URL = "cordova-android-previously-launched-url";

  private StartTabrisActivityReceiver startTabrisActivityReceiver;
  private SharedPreferences prefs;

  @Override
  public void onCreate( Bundle savedInstanceState ) {
    super.onCreate( savedInstanceState );
    super.init();
    // enable Cordova apps to be started in the background
    Bundle extras = getIntent().getExtras();
    if( extras != null && extras.getBoolean( "cdvStartInBackground", false ) ) {
      moveTaskToBack( true );
    }
    startTabrisActivityReceiver = new StartTabrisActivityReceiver( this );
    prefs = PreferenceManager.getDefaultSharedPreferences( this );
    setContentView( R.layout.main );
    LocalBroadcastManager.getInstance( this ).registerReceiver( startTabrisActivityReceiver,
        new IntentFilter( DownloadService.ACTION_RESOURCE_LOADING ) );
    String localResourceJsonUri = getLocalResourceJsonUri();
    if( localResourceJsonUri != null ) {
      startTabrisFromLocalResources( localResourceJsonUri );
    }
  }

  private String getLocalResourceJsonUri() {
    String resourceJsonFromCordovaConfig = getLocalResourceJsonFromCordovaConfig();
    if( resourceJsonFromCordovaConfig != null ) {
      return resourceJsonFromCordovaConfig;
    }
    String resourceJsonFromBuildConfig = getLocalResourceJsonFromBuildConfig();
    if( resourceJsonFromBuildConfig != null ) {
      return resourceJsonFromBuildConfig;
    }
    return null;
  }

  private String getLocalResourceJsonFromCordovaConfig() {
    if( launchUrl != null && launchUrl.endsWith( "package.json" ) ) {
      return launchUrl.replaceFirst( "file:///android_asset/", "" );
    }
    return null;
  }

  private String getLocalResourceJsonFromBuildConfig() {
    try {
      getAssets().open( BuildConfig.JS_APP ).close();
      return BuildConfig.JS_APP;
    } catch( IOException e ) {
      return null;
    }
  }

  private void startTabrisFromLocalResources( String localResourceJsonUri ) {
    try {
      String uri = stripPackageJson(localResourceJsonUri);
      AssetBootLoader bootLoader = new AssetBootLoader( getAssets(), uri );
      JavaScriptApp javaScriptApp = new JavaScriptApp( bootLoader.getBaseUri() );
      javaScriptApp.addFiles( bootLoader.load() );
      javaScriptApp.setLocalResourceRootUris( getLocalResourceRootUris() );
      startTabrisActivity( javaScriptApp, uri.equals( stripPackageJson(getLocalResourceJsonUri()) ) );
    } catch( Exception e ) {
      showError( "Can not start app.\n" + e.getMessage() );
    }
  }

  public static String stripPackageJson(String path) {
    if (path == null) {
      return null;
    }
    String trimmedPath = path.trim();
    if (trimmedPath.endsWith("package.json")) {
      return trimmedPath.substring(0, trimmedPath.length() - "package.json".length() - 1);
    }
    return path;
  }
  
  private List<Uri> getLocalResourceRootUris() {
    List<String> uriStrings = asList(BuildConfig.LOCAL_RESOURCE_ROOT_URIS.split(","));
    if( !uriStrings.isEmpty() ) {
      List<Uri> uris = new ArrayList<>();
      for( String string : uriStrings ) {
        uris.add( Uri.parse( string ) );
      }
      return uris;
    }
    return null;
  }

  private void startTabrisActivity( JavaScriptApp javaScriptApp, boolean standaloneApp ) {
    Intent intent = new Intent( this, TabrisActivity.class );
    intent.putExtras( getIntent() );
    intent.addFlags( Intent.FLAG_ACTIVITY_CLEAR_TOP );
    intent.putExtra( JavaScriptApp.EXTRA_JAVA_SCRIPT_APP, javaScriptApp );
    intent.putExtra( TabrisActivity.EXTRA_DEV_MODE, preferences.getBoolean( "EnableDeveloperConsole", false ) );
    intent.putExtra( TabrisActivity.EXTRA_STRICT_SSL, preferences.getBoolean( "UseStrictSSL", true ) );
    intent.putExtra( TabrisActivity.EXTRA_THEME, getTheme( javaScriptApp ) );
    intent.putExtra( TabrisActivity.EXTRA_SHOW_SYSTEM_BAR, !preferences.getBoolean( "Fullscreen", false ) );
    intent.putExtra( TabrisActivity.EXTRA_STANDALONE_APP, standaloneApp );
    startActivityForResult( intent, 0 );
  }

  private int getTheme( JavaScriptApp javaScriptApp ) {
    if( javaScriptApp.getBaseUri().equals( URI_ANDROID_ASSET + "www/bundled_tabris_js_launcher" ) ) {
      return R.style.Theme_Tabris_Light_DarkAppBar;
    }
    return 0;
  }

  @Override
  protected void onResume() {
    super.onResume();
    ( ( LoadingIndicator )findViewById( R.id.ca_loading_indicator ) ).onResume();
  }

  @Override
  protected void onPause() {
    super.onPause();
    ( ( LoadingIndicator )findViewById( R.id.ca_loading_indicator ) ).onPause();
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    LocalBroadcastManager.getInstance( this ).unregisterReceiver( startTabrisActivityReceiver );
  }

  @Override
  protected void onActivityResult( int requestCode, int resultCode, Intent data ) {
    if( resultCode == TabrisActivity.RESULT_CODE_RESTART ) {
      handleResultRestart( data );
    } else if( resultCode == TabrisActivity.RESULT_CODE_ERROR ) {
      handleResultError( data );
    } else if( resultCode == TabrisActivity.RESULT_CODE_CLOSE ) {
      finish();
    }
  }

  private void handleResultRestart( Intent data ) {
    String localResourceJsonUri = getLocalResourceJsonUri();
    if( data != null && data.hasExtra( TabrisActivity.RESULT_EXTRA_URL ) ) {
      startTabrisFromUrl( data.getStringExtra( TabrisActivity.RESULT_EXTRA_URL ) );
    } else if( localResourceJsonUri != null ) {
      startTabrisFromLocalResources( localResourceJsonUri );
    } else {
      startTabrisFromRecentlyLaunched();
    }
  }

  private void startTabrisFromUrl( String url ) {
    if( Uri.parse( url ).isRelative() ) {
      startTabrisFromLocalResources( getAppBasePath() + url );
    } else if( url.startsWith( URI_ANDROID_ASSET ) ) {
      String localResourceJsonUri = url.replaceFirst( URI_ANDROID_ASSET, "" );
      startTabrisFromLocalResources( localResourceJsonUri );
    } else {
      startTabrisFromRemoteResources( url );
    }
  }

  private String getAppBasePath() {
    String localResourceJsonUri = getLocalResourceJsonUri();
    List<String> pathSegments = new ArrayList<>( Uri.parse( localResourceJsonUri ).getPathSegments() );
    if( !pathSegments.isEmpty() ) {
      pathSegments.remove( pathSegments.size() - 1 );
      return TextUtils.join("/", pathSegments) + "/";
    }
    return "";
  }

  private void startTabrisFromRecentlyLaunched() {
    String url = prefs.getString( PREF_RECENTLY_LAUNCHED_URL, null );
    if( url != null ) {
      startTabrisFromRemoteResources( url );
    }
  }

  private void handleResultError( Intent data ) {
    if( data != null ) {
      showError( data.getStringExtra( TabrisActivity.RESULT_MESSAGE ) );
    } else {
      showError( "The app did not work as expected." );
    }
  }

  private void showError( String message ) {
    AlertDialog.Builder builder = new AlertDialog.Builder( this );
    builder.setTitle( R.string.app_name );
    builder.setMessage( message );
    builder.setPositiveButton( android.R.string.ok, null );
    builder.show();
  }

  public void startTabrisFromRemoteResources( String url ) {
    String strippedUrl = stripPackageJson(url);
    prefs.edit().putString( PREF_RECENTLY_LAUNCHED_URL, strippedUrl ).apply();
    LoadRequest loadRequest = new LoadRequest( strippedUrl );
    loadRequest.setLocalResourceRootUris( getLocalResourceRootUris() );
    Intent serviceIntent = new Intent( this, DownloadService.class );
    serviceIntent.putExtra( DownloadService.EXTRA_LOAD_REQUEST, loadRequest );
    startService( serviceIntent );
  }

  public class StartTabrisActivityReceiver extends BroadcastReceiver {

    private Activity activity;

    public StartTabrisActivityReceiver( Activity activity ) {
      this.activity = activity;
    }

    @Override
    public void onReceive( Context context, Intent intent ) {
      if( !intent.hasExtra( DownloadService.EXTRA_ERROR_MESSAGE ) ) {
        JavaScriptApp javaScriptApp = ( JavaScriptApp )intent.getParcelableExtra( DownloadService.EXTRA_JAVA_SCRIPT_APP );
        startTabrisActivity( javaScriptApp, false );
      } else {
        handleFailure( intent );
      }
    }

    private void handleFailure( Intent intent ) {
      activity.finish();
      activity.startActivity( activity.getIntent() );
    }
  }

}
