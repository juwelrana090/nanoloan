# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:


# Custom ProGuard Rules (Auto-generated)
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}

# React Native Reanimated & Worklets
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.swmansion.worklets.** { *; }
-keep class com.swmansion.common.** { *; }

# NitroModules - CRITICAL for app to work
-keep class com.margelo.nitro.** { *; }
-keepclassmembers class com.margelo.nitro.** { *; }
-keep interface com.margelo.nitro.** { *; }
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes InnerClasses

# Expo Constants & Modules
-keep class expo.modules.** { *; }
-keepclassmembers class expo.modules.constants.ExpoConstants {
    *;
}
-keepclassmembers class * {
    @expo.modules.* <methods>;
}

# Keep all native methods
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# React Native Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# WebRTC
-keep class org.webrtc.** { *; }
-keep class com.oney.WebRTCModule.** { *; }
-dontwarn org.webrtc.**

# Socket.IO
-keep class io.socket.** { *; }
-keepclassmembers class io.socket.** { *; }
-dontwarn io.socket.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Redux Persist & AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keepclassmembers class * {
    @com.reactnativecommunity.asyncstorage.** *;
}

# Hermes
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Permissions
-keep class com.zoontek.rnpermissions.** { *; }

# Bluetooth State Manager
-keep class com.sogilis.ReactNativeBluetooth.** { *; }

# Device Info
-keep class com.learnium.RNDeviceInfo.** { *; }

# Incall Manager
-keep class com.zxcpoiu.incallmanager.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Screens
-keep class com.swmansion.rnscreens.** { *; }

# JSI & Bridge
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.jsi.** { *; }
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }
-keep class com.facebook.react.modules.** { *; }

# React Native TurboModules
-keep class com.facebook.react.turbomodule.core.** { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Keep all React Native native modules
-keepclassmembers class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    *;
}
-keepclassmembers class * extends com.facebook.react.bridge.BaseJavaModule {
    *;
}

# Hermes JSI
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.common.** { *; }

# Keep all enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
