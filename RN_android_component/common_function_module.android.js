/**
 * Created by yunpengfeng on 16/4/14.
 */
/**
 * 常用本地功能模块
 * 目前提供的功能:
 * showDevMenu():显示调试菜单
 * 使用示例:
 * var MyCommonAndroid = require('./myModule/common_function_module');
 * MyCommonAndroid.showDevMenu()
 */
'use strict'
var {NativeModules} = require('react-native');

module.exports =NativeModules.CommonFunctionModule;