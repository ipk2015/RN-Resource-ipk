### 安装apktool流程
官网安装链接 https://ibotpeaches.github.io/Apktool/install/
一定注意别下载错了平台，否则一定安装不成功

上面的1-4都容易理解和执行，
第四步看不到文件的话需要执行隐藏文件可见的命令。
第5步要确认两个文件是有执行权限的，首先确认是在/usr/loacl/bin目录下。
执行上面的chmod +x可能看不到成效（我没有成功...），此时可以尝试执行
`chmod 777 apktool`
然后继续执行
`./apktool`
此时如果出现Permission denied的话说明文件是没有执行权限的。
第6步 可以执行
`apktool -v`
来查看是否安装成功

一篇博客：http://blog.csdn.net/yanzi1225627/article/details/48215549

### 使用方法
#### 反编译
在apk所在文件夹运行命令
`apktool d hongbao.apk`
执行后会出现apk名字的文件夹，点进去可以看到清单文件、res、smali等资源

#### 回编译
在上面反编译的文件夹内运行命令
`apktool b hongbao`
在hongbao文件夹内会多出build和dist文件夹，dist内有刚才生成的未签名app

#### 给APP签名
签名需要用到keytool,没有安装的请下载安装，很简单。
目前签名的方式有几种，此处先用最简单的一种来，后面再完善这部分

-  生成签名

`keytool -genkey -keystore test.keystore  -alias test -keyalg RSA -validity 10000`
填写资料时基本是随便填的，记住密码和别名（如上面的test）就行

-  为apk增加签名

`jarsigner -verbose -keystore test.keystore -signedjar hongbao-signed.apk hongbao-unsigned.apk 'test'`

#### 生成jar文件并查看

- 首先进入到刚才解压缩生成的dex2jar-2.0文件夹下，执行命令

`./d2j-dex2jar.sh /Users/yanzi/apk/hongbao.apk `

执行后会在当前文件夹下生成类似hongbao-dex2jar.jar的文件
如果提示执行sh文件没有权限的话同上面一样执行
`chmod 777 d2j-dex2jar.sh`

- 进入到刚才解压缩生成的jd-gui-osx-1.4.0文件夹下，打开JD-GUI.app，将上面生成的jar文件拖进去打开看就可以看到java文件

#### 查看APK签名信息
1. 用jarsigner查看apk文件
`jarsigner -verify -verbose -certs <your_apk_path.apk>`

2. 用keytool直接查看签名文件（前提是有签名文件），到keystore文件所在目录下，
`keytool -list -v -keystore debug.keystore`

3. 查看三方应用或是系统应用签名用winrar打开待查看的apk，将其中META-INF文件夹解压出来，得到其中的CERT.RSA文件，通过keytool -printcert -file META-INF/CERT.RSA命令打印证书信息
