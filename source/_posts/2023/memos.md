---
title: 开发备忘录
categories: Develop
comments: true
keywords: java,javascript
tags: [workspace]
description: 工作备忘记录
created: '2023-04-12T16:00:31.050Z'
modified: '2023-09-25T06:00:01.081Z'
---

# Spring boot 相关

## 纠错
>首先，bootstrap.yml作为配置文件，是在springcloud中实现的，而不是springboot！
>sb根本就不会加载bootstrap.yml！
> 百度的答案都是sb中这两者区别，错到德玛西亚去了。

- **认识bootstrap.yml**
在springcloud中，使用bootstrap首先加载一些配置，这部分是高优先级不会被后续覆盖的。
通常是用做加载配置中心配置。不要在这里配置其他属性，会出现很诡异的事。(我测了，配置0000，得出0)所以就乖乖的按照springcloud的建议来。最后，`bootstrap.yml`作为配置文件，是springcloud中的定义

## Spring Cloud Open Fegin
- FEIGN是走HTTP的，即使利用接口特性做成类RPC的方式，但也还是走HTTP的。但是就我使用感受，速度还行，比想象中要快。rpc固然速度比http快，但是你要考虑的稳定性、数据传输的可靠性、熔断保护，以及更方便的链路监控和追踪，这时候HTTP的优势就体现了。

- Spring cloud的http从以下几个方面可以优化
  - 换成okhttp3。
  - 应用中不要做异步传输，防止异步等待，如果遇到异步场景，一定要利用好消息队列和缓存。
  - 如果http1.1，有些场景利用keep-alive，减少连接损耗。
  - 可以考虑尝试HTTP/2

## Springboot2.x

-  Spring boot 2.x 无法使用`servlet: context-path`, 采用的是 `spring.webflux.base-path:`
- @ConditionalOnProperty 注解介绍
```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE, ElementType.METHOD })
@Documented
@Conditional(OnPropertyCondition.class)
public @interface ConditionalOnProperty {
    // 数组，获取对应property名称的值，与name不可同时使用
    
    String[] value() default {};

    // 配置属性名称的前缀，比如spring.http.encoding

    String prefix() default "";

    // 数组，配置属性完整名称或部分名称

    // 可与prefix组合使用，组成完整的配置属性名称，与value不可同时使用

    String[] name() default {};

    // 可与name组合使用，比较获取到的属性值与havingValue给定的值是否相同，相同才加载配置

    String havingValue() default "";

    // 缺少该配置属性时是否可以加载。如果为true，没有该配置属性时也会正常加载；反之则不会生效

    boolean matchIfMissing() default false;
}
```
## Springboot data redis 和data-elasticsearch中的netty冲突
### 使用场景
- `spring-data-elasticsearch` 和 `spring-boot-data-redis`都是使用的netty作为通信框架, 如果在加载时优先加载redis 链接的bean, 那么后续es创建时会导致启动失败, 异常日志 `Caused by: java.lang.IllegalStateException: availableProcessors is already set to [4], rejecting [4]`
- 具体原因在elasticsearch项目的这个类中有实现, 原因是又针对netty的处理器配置设置了一次参数,导致nettyRutime时检测到重复赋值...
```java
package org.elasticsearch.transport.netty4;
// 省略....


public class Netty4Utils {

    private static final AtomicBoolean isAvailableProcessorsSet = new AtomicBoolean();

    /**
     * Set the number of available processors that Netty uses for sizing various resources (e.g., thread pools).
     *
     * @param availableProcessors the number of available processors
     * @throws IllegalStateException if available processors was set previously and the specified value does not match the already-set value
     */
    public static void setAvailableProcessors(final int availableProcessors) {
        // we set this to false in tests to avoid tests that randomly set processors from stepping on each other
        final boolean set = Booleans.parseBoolean(System.getProperty("es.set.netty.runtime.available.processors", "true"));
        if (set == false) {
            return;
        }

        /*
         * This can be invoked twice, once from Netty4Transport and another time from Netty4HttpServerTransport; however,
         * Netty4Runtime#availableProcessors forbids settings the number of processors twice so we prevent double invocation here.
         */
        if (isAvailableProcessorsSet.compareAndSet(false, true)) {
            NettyRuntime.setAvailableProcessors(availableProcessors);
        } else if (availableProcessors != NettyRuntime.availableProcessors()) {
            /*
             * We have previously set the available processors yet either we are trying to set it to a different value now or there is a bug
             * in Netty and our previous value did not take, bail.
             */
            final String message = String.format(
                Locale.ROOT,
                "available processors value [%d] did not match current value [%d]",
                availableProcessors,
                NettyRuntime.availableProcessors()
            );
            throw new IllegalStateException(message);
        }
    }
```
- [为什么设置默认值?](https://discuss.elastic.co/t/need-info-for-es-set-netty-runtime-available-processors/111322/2)
### 解决方案
- github的[issus](https://github.com/elastic/elasticsearch/issues/41176)
- 将es配置优先加载
- 启动类中添加覆盖配置
```java
public static void main(String[] args) {  
	System.setProperty("es.set.netty.runtime.available.processors", "false");  
	SpringApplication.run(Application.class, args);  
}

// or

static {
	System.setProperty("es.set.netty.runtime.available.processors", "false");
}

```
- 启动时添加启动参数也可以覆盖配置 `-Des.set.netty.runtime.available.processors=false`
### 总结
> 如果集成了其他使用netty的相关框架在spring boot配置类中加载, 都会导致和`elasticserach`配置冲突造成启动失败, 例如: `spring-boot-starter-actuator`中的`elasticsearch`健康检查配置

## Spring boot validator 校验 和 独立配置返回消息内容整合
- `spring boot validator`是由`hibernate-validator`实现的, `hibernate-validator` 使用的是 `JSR-303` 的默认`ValidationMessages.properties`包, 所以需要手动设置加载自定义`springboot message`文件
> 官方解释: 指定用于解析验证消息的自定义 `Spring MessageSource`，而不是依赖 JSR-303 的默认`ValidationMessages.properties`包,在类路径中。 这可能指的是 Spring 上下文的共享`messageSource`

```java
   /**
     * Specify a custom Spring MessageSource for resolving validation messages,
	 * instead of relying on JSR-303's default "ValidationMessages.properties" bundle
	 * in the classpath. This may refer to a Spring context's shared "messageSource" bean,
     */
	@Bean
	public LocalValidatorFactoryBean localValidatorFactoryBean() {
		LocalValidatorFactoryBean localValidatorFactoryBean = new LocalValidatorFactoryBean();
		ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
		messageSource.setBasename("classpath:messages"); // 这里加载自定message.properties文件
		localValidatorFactoryBean.setValidationMessageSource(messageSource);
		return localValidatorFactoryBean;
	}
```
> **问题:** `LocalValidatorFactoryBean`设置自定义的`messageSource`不生效, 是由于项目中有配置继承了`WebMvcConfigurationSupport`类, 导致`Validator`实例会被该配置中的`OptionalValidatorFactoryBean`类创建的`LocalValidatorFactoryBean`覆盖掉丢失`messageSource`
> **解决:** 修改继承的`WebMvcConfigurationSupport`类替换成实现`WebMvcConfigurer`即可,这样会加载`WebMvcAutoConfiguration`配置, spring mvc会判断是否加载了`Validator`直接使用

- 声明校验错误提示信息配置
```properties
# message.properties
name.length.validation=名称长度只允许在{min} ~ {max}之间
```
- 在实体类中属性上使用相关注解
```java
@Length(min = 8, max = 100, message = "{name.length.validation}")
private String name;
```

- 还可以使用`MessageSource`进行动态添加占位符参数, 调整返回的校验消息内容
```properties
# message.properties
name.length.validation={0} 名称长度只允许在{min} ~ {max}之间
```
- 完整的异常处理方法, 全局拦截
```java
    @Autowired
    private MessageSource messageSource;

    /**
     * 处理调用接口validator失败抛出的异常
     */
    @ExceptionHandler(BindException.class)
    public ResponseResult<Void> bindExceptionHandler(MethodArgumentNotValidException argumentNotValidException) {
        List<FieldError> fieldErrors = argumentNotValidException.getBindingResult().getFieldErrors();
        List<String> collect = fieldErrors.stream()
                // 如果不使用messageSource进行参数处理,则可直接返回fieldError.getDefaultMessage()
                .map(fieldError -> getMessage(fieldError.getDefaultMessage(), new Object[]{fieldError.getField()}, fieldError.getDefaultMessage(), LocaleContextHolder.getLocale()))
                .collect(Collectors.toList());
        return ResponseResult.error(String.valueOf(HttpStatus.BAD_REQUEST.value()), "数据验证失败，不合法的参数格式，请核对！", collect);
    }

   public String getMessage(String code, Object[] args, String defaultMessage, Locale locale) {
        return messageSource.getMessage(code, args, defaultMessage, locale);
    }
```
- 如果是在方法层级校验, 需要设置自定义的校验器, 否则无法返回`mesages.properties`的错误消息
```java
    /**
	 * 设置方法验证后处理器的校验器
	 * @return
	 */
	@Bean
	public MethodValidationPostProcessor methodValidationPostProcessor() {
		MethodValidationPostProcessor methodValidationPostProcessor = new MethodValidationPostProcessor();
		methodValidationPostProcessor.setValidator(localValidatorFactoryBean());
		return methodValidationPostProcessor;
	}
```
 
- 接口中使用注解方式
```java
@Validated
public class User {
    void mergeUser (@NotBlank(message="{name.isNotBlank}")
                                 @Length(max=10, message=""{name.length.validation}") String name)
}
```
- 声明校验错误提示信息配置
```properties
# message.properties
name.length.validation=名称长度只允许在{min} ~ {max}之间
name.isNotBlank=名称不能为空
```
## spring boot 内置tomcat设置
```java
@Bean
    public TomcatServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
        factory.addContextCustomizers(context -> {
            SecurityConstraint securityConstraint = new SecurityConstraint();
            securityConstraint.setUserConstraint("CONFIDENTIAL");
            SecurityCollection collection = new SecurityCollection();
            collection.addPattern("/*");
            collection.addMethod("HEAD");
            collection.addMethod("PUT");
            collection.addMethod("PATCH");
            collection.addMethod("DELETE");
            collection.addMethod("TRACE");
            collection.addMethod("COPY");
            collection.addMethod("SEARCH");
            collection.addMethod("PROPFIND");
            securityConstraint.addCollection(collection);
            context.addConstraint(securityConstraint);
        });
        // 优化参数
        factory.addConnectorCustomizers(connector -> {
            connector.setAllowTrace(true);
			connector.setPort(8083);
			connector.setProperty("connectionTimeout", "30000");
             //CPU数
			connector.setProperty("acceptorThreadCount", "4");
			connector.setProperty("minSpareThreads", "50");
			connector.setProperty("maxSpareThreads", "50");
			connector.setProperty("maxThreads", "1000");
			connector.setProperty("maxConnections", "10000");
			connector.setProperty("protocol", "org.apache.coyote.http11.Http11Nio2Protocol");
			connector.setProperty("redirectPort", "443");
			connector.setProperty("compression", "on");
        });
        return factory;
    }
```
## Ali QL Express 工具使用
- 初始化
- 转换表达式
- 执行
## Mapstruct 插件
- idea 安装mapstruct support 插件, 写expression好用
-  不同类型使用代码表达式转换, `@Mapping`注解可以设置某个属性映射关系, `expression`表达式则是实现的源代码, 也可以使用`@Mapper`注解中导入的实现类的方法名
-  如果表达式中含有导入的外部包, 则使用 `@Mapper(import={Arrays.class}` 类似引入即可
```java
    @Mapper
    public interface MergeRuleConfigConvert extends BaseConvert<RuleConfigMergeVO, RuleConfigPO> {
        @Mapping(expression = "java(String.join(\",\", mergeVO.getRuleParamIds()))", target = "ruleParamId")
        RuleConfigPO toModel(RuleConfigMergeVO mergeVO);
    }
    public static final RuleConfigPO.MergeRuleConfigConvert CONFIG_MERGE_CONVERT = Mappers.getMapper(MergeRuleConfigConvert.class);
```

-  结合`lombok`插件, 实体类中涉及到继承父类属性, 并且都使用了`@SuperBuilder`, 自动生成的convert实现类不会出现问题
-  如果手动设置`@Mapping`,且转换类在使用父类属性时, 需要设置 `@Mapper(builder = @org.mapstruct.Builder(disableBuilder = true)`, 否则自动生成convert实现类方法中会直接编译成了父类导致报错
```java
    @Mapper(builder = @org.mapstruct.Builder(disableBuilder = true), imports = {Arrays.class})
    public interface RuleConfigResConvert extends BaseConvert<RuleConfigResVO, RuleConfigPO> {
        @Mapping(expression = "java(Arrays.asList(ruleConfigPO.getRuleParamId() .split(\",\")))", target = "ruleParamIds")
        RuleConfigResVO fromModel(RuleConfigPO ruleConfigPO);
    }
    public static final RuleConfigPO.RuleConfigResConvert CONFIG_RES_CONVERT = Mappers.getMapper(RuleConfigPO.RuleConfigResConvert.class);

```
## 启动脚本
- 假如当前jar包目录下有配置文件或者有config文件夹, 优先外部的,会覆盖内部. 也可手动指定
```shell
# 启动指定外部文件覆盖内部配置文件
nohup java -Xms2048M -Xmx2048M -XX:+UseParallelGC -XX:MaxPermSize=512M -jar ./flute-admin.jar -Dspring.config.location=./application.yml > /dev/null 2>&1
# 启动指定内部配置文件, 部
nohup java -Xms2048M -Xmx2048M -XX:+UseParallelGC -XX:MaxPermSize=512M -jar ./flute-admin.jar --spring.profiles.active=dev > /dev/null 2>&1
```
# Es 相关
## ES 跨集群搜索设置
- elasticsearch.yml 相关配置
```yml
http.host: 0.0.0.0
http.port: 9200
node.name: node-1
cluster.initial_master_nodes: ["node-1"]
cluster.name: cluster_name
network.host: 0.0.0.0
network.publish_host: 127.0.0.1  #一定要配置
http.cors.enabled: true

xpack.ml.enabled: false
xpack.security.enabled: false
```
- kibana.yml 设置
```yml
server.host: "0.0.0.0"
server.shutdownTimeout: "5s"
 # macos容器启动的kibana需要使用域名访问
elasticsearch.hosts: [ "http://docker.for.mac.host.internal:9201"] 
monitoring.ui.container.elasticsearch.enabled: true
i18n.locale: "zh-CN"
```

- 设置远程集群搜索
```curl
PUT _cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "cluster_one": {
          "seeds": [
            "IP:9300"
          ]
        },
        "cluster_two": {
          "seeds": [
            "IP:9301"
          ]
        },
        "cluster_three": {
          "seeds": [
            "IP:9302"
          ]
        }
      }
    }
  }
}

GET _cluster/health

GET _remote/info

GET flute_cluster:knowledgesearch/_search
```
## 组合查询
- example :   and condition1 or ( condition 2 and  condition 3)
```
POST _search
{
    "from": 0,
    "size": 20,
    "sort": {},
    "query": {
        "bool": {
            "should": [
                {
                    "term": {
                        "condition1": 0
                    }
                },
                {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "condition2": 1
                                }
                            },
                            {
                                "wildcard": {
                                    "condition3": {
                                        "wildcard": "*115916589957645297*"
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
}
```
# Vue 相关
## 优化
- vue-cli4 工程 `vue.config.js`设置
```js
chainWebpack: config => {
    config.module.rule('svg')
      .exclude.add(path.join(__dirname, 'src/assets/icon'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/).include
      .add(path.join(__dirname, 'src/assets/icon'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({ symbolId: 'icon-[name]' })
      .end()
    config.module
      .rule('image')
      .test(/\.(png|jpe?g|gif)(\?.*)?$/)
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        // 此处为ture的时候不会启用压缩处理,目的是为了开发模式下调试速度更快
        disable: process.env.NODE_ENV === 'development'
      }).end()
    
    config.when(process.env.VUE_BUILD_CONF === 'prod',
      config => {
        config.plugin('CompressionPlugin').use('compression-webpack-plugin', [{
          filename: '[path][base].gz',
          algorithm: 'gzip',
          // 要压缩的文件（正则）
          test: /\.(js|css|json|txt|ico|svg)(\?.*)?$/i,
          // 最小文件开启压缩
          threshold: 10240,
          minRatio: 0.8
        }])
        config
          .plugin('ScriptExtHtmlWebpackPlugin')
          .after('html')
          .use('script-ext-html-webpack-plugin', [{
            inline: /runtime\..*\.js$/
          }])
          .end()

        config
          .optimization.splitChunks({
            chunks: 'all',
            cacheGroups: {
              libs: {
                name: 'chunk-libs',
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
                chunks: 'initial' // only package third parties that are initially dependent
              },
              elementUI: {
                name: 'chunk-elementUI', // split elementUI into a single package
                priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
              },
              commons: {
                name: 'chunk-commons',
                test: resolve('src/components'), // can customize your rules
                minChunks: 3, //  minimum common number
                priority: 5,
                reuseExistingChunk: true
              }
            }
          })
        config.optimization.runtimeChunk('single')
        // 去掉debugger console
        config.optimization.minimizer('terser').tap((args) => {
          // 注释console.*
          args[0].terserOptions.compress.drop_console = true
          // remove debugger
          args[0].terserOptions.compress.drop_debugger = true
          // 移除 console.log
          args[0].terserOptions.compress.pure_funcs = ['console.log']
          // 去掉注释 如果需要看chunk-vendors公共部分插件，可以注释掉就可以看到注释了
          args[0].terserOptions.output = {
            comments: false
          };
          return args
        })
      }
    )
  }
```
# 使用docker 安装使用 onlyoffice 
## 安装
- 如果开启使用`example`页面功能, 需要需要配置`/etc/onlyoffice/documentserver-example/default.json`文件中的 example 的地址,配置为 docker 网卡地址
## 访问
- onlyoffice 是使用 jwt 签名进行验证用户的真实性以及请求来源的真实性
- 在 7.2 版本后默认启用了 jwt认证 功能, 启动服务会生成相应的签名密钥, 签名的密钥可以在 `/etc/onlyoffice/documentserver/local.json`中找到, 调用onlyoffice 页面时一定需要携带 token内容, 完整的参数 e.g
```json
{
    "document": {
        "info": {
            "owner": "Me",
            "favorite": null,
            "uploaded": "Wed Sep 13 2023"
        },
        "permissions": {
            "comment": true,
            "copy": true,
            "download": true,
            "edit": true,
            "print": true,
            "fillForms": true,
            "modifyFilter": true,
            "modifyContentControl": true,
            "review": true,
            "chat": true,
            "commentGroups": {},
            "protect": true
        },
        "fileType": "docx",
        "key": "1671695205",
        "urlUser": "http://localhost:4000/download?fileName=new.docx&userAddress%2FUsers%2Fdy%2FDevSoftWare%2Fidea%2Fgithub%2Fonlyoffice-example%2Fdocuments%2F127.0.0.1%2F",
        "title": "new.docx",
        "url": "http://localhost:4000/download?fileName=new.docx&userAddress=%2FUsers%2Fdy%2FDevSoftWare%2Fidea%2Fgithub%2Fonlyoffice-example%2Fdocuments%2F127.0.0.1%2F",
        "directUrl": "",
        "referenceData": {
            "instanceId": "http://localhost:4000",
            "fileKey": "{\"userAddress\":\"127.0.0.1\",\"fileName\":\"new.docx\"}"
        }
    },
    "documentType": "word",
    "editorConfig": {
        "actionLink": null,
        "callbackUrl": "http://localhost:4000/track?fileName=new.docx&userAddress=%2FUsers%2Fdy%2FDevSoftWare%2Fidea%2Fgithub%2Fonlyoffice-example%2Fdocuments%2F127.0.0.1%2F",
        "coEditing": null,
        "createUrl": "http://localhost:4000/create?fileExt=docx&sample=false",
        "customization": {
            "logo": {
                "image": "",
                "imageEmbedded": "",
                "url": "https://www.onlyoffice.com"
            },
            "goback": {
                "url": "http://localhost:4000/"
            },
            "autosave": true,
            "comments": true,
            "compactHeader": false,
            "compactToolbar": false,
            "compatibleFeatures": false,
            "forcesave": false,
            "help": true,
            "hideRightMenu": false,
            "hideRulers": false,
            "submitForm": false,
            "about": true,
            "feedback": true
        },
        "embedded": {
            "embedUrl": null,
            "saveUrl": null,
            "shareUrl": null,
            "toolbarDocked": null
        },
        "lang": "en",
        "mode": "edit",
        "user": {
            "id": "1",
            "name": "John Smith",
            "group": ""
        },
        "templates": [
            {
                "image": "",
                "title": "Blank",
                "url": "http://localhost:4000/create?fileExt=docx&sample=false"
            },
            {
                "image": "http://localhost:4000/css/img/file_docx.svg",
                "title": "With sample content",
                "url": "http://localhost:4000/create?fileExt=docx&sample=true"
            }
        ]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "desktop",
    "width": "100%",
    "height": "100%",
    "events": {}
}
```
- 请求原理: 后端生成配置信息以及使用 secret 密钥将配置信息签名 生成 token一并返回,  页面携带 token 以及文件地址访问 onlyoffice 服务, 借助 onlyoffice 的 api 打开编辑或预览文件
## 问题
在官方提供的后端spring 例子中, 创建文件无法打开页面问题, 在 chrome 中, 不安全的网站(非 https)内容默认是阻止重定向的, 在 chrome输入`chrome://settings/content`中找到相应网站设置不安全内容设置为允许
