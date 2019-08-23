<script>
    export default {
        methods: {
            test: () => {
                let arr = ['1','2','a','b','4','3']
                console.log(arr)
                let Reg = /^\d$/
                let numArr = []
                let letterArr = []
                for(let item of arr) {
                    let result = Reg.test(item)
                    // console.log(item, result)
                    if(result) {
                        numArr.push(parseInt(item))
                    } else {
                        letterArr.push(item)
                    }
                }
                console.log(numArr.sort())
                console.log(letterArr)
                let add = [1,2] + [3,4]
                console.log(typeof add)

                async function timeout(ms) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, ms);
                    });
                }

                async function asyncPrint(value, ms) {
                    await timeout(ms)
                    console.log(value);
                }

                asyncPrint('hello world', 1000);
            }
        },
        onLaunch: function() {
            this.test()
            console.log('App Launch');
            // #ifdef APP-PLUS
            // 锁定屏幕方向
            plus.screen.lockOrientation('portrait-primary'); //锁定
            // 检测升级
            uni.request({
                url: 'https://uniapp.dcloud.io/update', //检查更新的服务器地址
                data: {
                    appid: plus.runtime.appid,
                    version: plus.runtime.version,
                    imei: plus.device.imei
                },
                success: (res) => {
                    console.log('success', res);
                    if (res.statusCode == 200 && res.data.isUpdate) {
                        let openUrl = plus.os.name === 'iOS' ? res.data.iOS : res.data.Android;
                        // 提醒用户更新
                        uni.showModal({
                            title: '更新提示',
                            content: res.data.note ? res.data.note : '是否选择更新',
                            success: (showResult) => {
                                if (showResult.confirm) {
                                    plus.runtime.openURL(openUrl);
                                }
                            }
                        })
                    }
                }
            })

            var domModule = weex.requireModule('dom');
            domModule.addRule('fontFace', {
                'fontFamily': "uniicons",
                'src': "url('./static/uni.ttf')"
            });
            // #endif
        },
        onShow: function() {
            console.log('App Show')
        },
        onHide: function() {
            console.log('App Hide')
        }
    }
</script>

<style>
    /* #ifndef APP-PLUS-NVUE */
    /* uni.css - 通用组件、模板样式库，可以当作一套ui库应用 */
    @import './common/uni.css';

    /* 以下样式用于 hello uni-app 演示所需 */
    page {
        background-color: #F4F5F6;
        height: 100%;
        font-size: 28upx;
        line-height: 1.8;
    }

    .uni-header-logo {
        padding: 30upx;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 10upx;
    }

    .uni-header-image {
        width: 100px;
        height: 100px;
    }

    .uni-hello-text {
        color: #7A7E83;
    }

    .uni-hello-addfile {
        text-align: center;
        line-height: 300upx;
        background: #FFF;
        padding: 50upx;
        margin-top: 10px;
        font-size: 38upx;
        color: #808080;
    }

    /* #endif*/
</style>
