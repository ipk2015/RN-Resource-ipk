### 0.0 
  RN 1.0不知何时才能推出，目前看还是遥遥无期。而学习使用过程中bug不断，踩坑常有。故于此记录，以便日后查询。

1. RN 0.45版本在使用时若初始化后没有做其他改变时不能正常启动，可能与npm版本有关，试着把RN版本降到0.44或者调整下npm版本试试

2. RN 0.45版本（也许不止这一个版本）在RN目录下放入图片文件，在run Android时可能会发生此图片文件被提示在 mdpi-v4和mdpi（或hdpi等相似名称）文件夹下都存在的错误，在RN 的github的issue下有人已经提出，可能与gradle版本有关。试试直接以网络图片形式引入。

3. Text组件在乐视手机上可能会出现吞字的现象：例如value = 12345678,显示时只有1234567，这种情况试试value+" ",即在后面加一个空白格。

4. 同第一条相同，RN0.45版本及以上在Android上没有问题，在iOS上初始化后啥都没干也不能正常跑起来。

  真正问题原因在于 .rncache 这个文件夹（是隐形文件），这个文件夹如名字所示是RN的缓存，存在于自己的磁盘目录到自己的RN工程目录之间的某一级目录下。之前的版本里这个文件夹里只有两个文件，0.45以后这个文件夹里需要有四个文件。但这个文件夹并没有随着init RN工程版本的提升而自动添加文件。也有说是因为需要翻墙，不过我做的只是删除这个文件夹，然后重新npm install之后这个文件夹就更新了，然后就可以正常run了...
  
  总的来说就是这个文件夹里的文件需要添加更新，否则0.45以后的版本没法跑起来。至于怎么添加更新，可以像我这样删除后重新npm installl，也可以如中文网那样把文件主动拷贝一份过去。RN中文网相关问题：http://reactnative.cn/post/4301
  
5. `error: bundling failed: "TransformError: ......./index.ios.js: Unexpected token ) (While processing preset: "......../node_modules/babel-preset-react-native/index.js")"`
  问题原因在于babel版本，将package.json里的版本改为2.1.0即可
  `"babel-preset-react-native": "2.1.0",`
