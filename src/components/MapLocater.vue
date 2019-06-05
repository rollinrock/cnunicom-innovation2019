<template>
    <div class="wrapper">
        <el-form :inline="true" :model="searchInputs">
            <el-form-item label="搜索地点">
                <el-input id="pickerInput" v-model="searchInputs.location" placeholder="请输入搜索地点" clearable="true"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="doSearch">搜索</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="doEvaluate">开始评估</el-button>
            </el-form-item>
        </el-form>
        <el-dialog title="评估参数" :visible.sync="evaluating" :show-close="false">
            <el-form :model="bStation" label-width="150px">
                <el-form-item label="选址地点"><el-input readonly v-model="address"></el-input></el-form-item>
                <el-form-item label="需求网络">
                    <el-switch v-model="bStation.network" active-text="4G" inactive-text="3G"></el-switch>
                </el-form-item>
                <el-form-item label="设备来源">
                    <el-switch v-model="bStation.equipmentSource" active-text="新购" inactive-text="利旧"></el-switch>
                </el-form-item>
                <el-form-item label="设备类型">
                    <el-radio-group v-model="bStation.equipmentType" size="medium">
                        <el-radio-button label="L900"></el-radio-button>
                        <el-radio-button label="L1800"></el-radio-button>
                        <el-radio-button label="UL2100"></el-radio-button>
                        <el-radio-button label="UBR"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="方向选择">
                    <el-radio-group v-model="bStation.direction" size="medium">
                        <el-radio-button label="1"></el-radio-button>
                        <el-radio-button label="2"></el-radio-button>
                        <el-radio-button label="3"></el-radio-button>
                        <el-radio-button label="4"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="铁塔租用">
                    <el-radio-group v-model="bStation.rent" size="medium">
                        <el-radio-button label="自建" aria-checked="true"></el-radio-button>
                        <el-radio-button label="友商共享"></el-radio-button>
                        <el-radio-button label="新租"></el-radio-button>
                        <el-radio-button label="叠加"></el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="新增传输设备">
                    <el-switch v-model="bStation.newTransferEquipment"></el-switch>
                </el-form-item>
                <el-form-item label="新增传输距离(米)">
                    <el-input v-model="bStation.transDistance" type="number"></el-input>
                </el-form-item>
                <el-form-item label="确定新增收入(元/月)">
                    <el-input v-model="bStation.income" type="number"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitEvaluate">评估</el-button>
                    <el-button @click="evaluating=false" >取消</el-button>
                </el-form-item>
            </el-form>

        </el-dialog>
        <el-row>
            <el-col :span="20">
                <div class="map-wrapper">
                    <el-amap class="amap-box" :plugin="mapPlugins" :center="mapCenter" :zoom="mapZoom" :events="mapEvents">
                        <el-amap-marker vid="clickMarker" :visible="true" :position="[clickLng, clickLat]" 
                            ></el-amap-marker>

                        <!-- <el-amap-info-window :position="[clickLng, clickLat]" :visible="showInfoWindow">
                            <div :style="slotStyle">
                                <b>{{address}}</b>
                            </div>
                        </el-amap-info-window>     -->
                
                    </el-amap>
                    
                </div>
            </el-col>
        </el-row>
        <el-row>
            <p>坐标：[{{clickLng}}，{{clickLat}}] 地址：{{address}}</p>
        </el-row>
    </div>
    
</template>

<script>
import { lazyAMapApiLoaderInstance } from 'vue-amap'
import axios from'axios'

export default {
    name: 'map-locater',
    props: [],
    data() {
        let self = this
        return {
            bStation: {
                network: "",
                equipmentSource: "",
                equipmentType: "L900",
                direction: "1",
                rent: "自建",
                newTransferEquipment: true,
                transDistance: 0,
                income: 0
            },
            evaluating: false,
            showInfoWindow: false,
            clickLng: 0,
            clickLat: 0,
            address: "",
            mapCenter: [119.66438, 29.07143],
            mapZoom: 14,
            amap: null,
            autoComplete: null,
            placeSearch: null,
            cloverMapLayerCanvas: null,
            searchInputs: {
                location: null
            },
            slotStyle: { //信息窗体样式
                padding: '4px 8px',
                background: '#eee',
                color: '#333',
                border: '1px solid gray'
            },
            

            mapPlugins: [
                'ToolBar', {
                pName: 'Geolocation',
                events: {
                    init(map) {
                        map.getCurrentPosition((status, result) => {
                            if (result && result.position) {
                                self.mapCenter = [result.position.lng, result.position.lat]
                                self.$nextTick()
                            }
                        })
                    }
                }
                
                
            }],
            mapEvents: {
                init(map) {
                    console.log('map inited')
                    self.amap = map
                    let autoComplete = self.autoComplete = new AMap.Autocomplete({input: 'pickerInput'})
                    let placeSearch = self.placeSearch = new AMap.PlaceSearch({map: self.amap})
                    AMap.event.addListener(autoComplete, 'select', evt => {
                        placeSearch.search(evt.poi.name)
                    })

                    let cloverMapLayerCanvas = self.cloverMapLayerCanvas = document.createElement('canvas');
                    cloverMapLayerCanvas.height = map.getSize().getHeight();
                    cloverMapLayerCanvas.width = map.getSize().getWidth();

                    //创建自定义图层
                    let cloverMapLayer = self.cloverMapLayer = new AMap.CustomLayer(cloverMapLayerCanvas, {
                        map: self.amap,
                        opacity: 0.8,
                        zindex: 12
                    });
                    cloverMapLayer.render = self.renderCloverMapLayer;
                    cloverMapLayer.render();
                },
                click(evt) {
                    self.clickLng = evt.lnglat.lng
                    self.clickLat = evt.lnglat.lat
                    let geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "all"
                    })
                    geocoder.getAddress([self.clickLng, self.clickLat], (status, result) => {
                        if (status === 'complete' && result && result.info === 'OK') {
                            if (result.regeocode) {
                                self.address = result.regeocode.formattedAddress
                                self.$nextTick
                                if (!self.showInfoWindow) {
                                    self.showInfoWindow = true;
                                }

                            }
                        }
                    })

                }
            }
        }
    },
    created() {
        
        let self = this
        lazyAMapApiLoaderInstance.load().then(() => {
            AMap.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.CustomLayer'], () => {
                //实例创建时即异步加载相关插件
            })
        })
        console.log('lifecycle hook created invoked')
    },
    amounted() {
        console.log('lifecycle hook amounted invoked')
        
        
    },
    methods: {
        doSearch() {
            console.log(this.searchInputs.location)
            if (this.searchInputs.location) {
                this.placeSearch.search(this.searchInputs.location)
            }
        },
        handleSearchResult(pois) {
            this.$alert('处理查找结果', '查找成功');
        },
        doEvaluate(evt) {
            if (!this.address) {
                this.$notify.error({
                    title: '评估错误',
                    message: '请先点击地图进行选址'
                })
                return
            }
            this.evaluating = true
            
        },
        submitEvaluate() {
            this.$message('评估完成提示')
            this.evaluating = false
        },
        renderCloverMapLayer(){
            let self = this;
            if (this.cloverMapLayer && this.cloverMapLayerCanvas && this.cloverMapLayerCanvas.getContext) {
                let canvasContext = self.canvasContext;
                if (!self.canvasContext) {
                    canvasContext = self.canvasContext = this.cloverMapLayerCanvas.getContext('2d');
                } else {
                    this.cloverMapLayerCanvas.height = this.cloverMapLayerCanvas.height; //重设进行画布内容清空
                }
                
                canvasContext.strokeStyle = 'green';
                canvasContext.fillStyle = 'red';
                canvasContext.fillOpacity = 1;
                // 绘制三叶草图
                // axios.get('http://zjjh.chinaunicom.cn:8089/v1/base_station/search', {
                axios.get('http://localhost:8089/v1/base_station/search', {
                    params: {
                        longitude: this.amap.getCenter().getLng(),
                        latitude: this.amap.getCenter().getLat(),
                        radius: 10000
                    }
                }).then(function(response) {
                    console.log(response.data);
                    console.log(response.resultCode === '0');
                    let result = response.data;
                    if (result.requestSuccessful && result.resultCode === '0') {
                        let clovers = result.data;
                           
                        clovers.forEach(clover => {
                            //canvas 绘制代码
                            let location = self.amap.lngLatToContainer([clover.center.longitude, clover.center.latitude]);
                            // let sector = clover.sectors[0];
                            canvasContext.beginPath();
                            canvasContext.moveTo(location.x, location.y);
                            canvasContext.arc(location.x, location.y, clover.radius, 2 * Math.PI * clover.deviationDegree / 360, 
                                2 * Math.PI * (clover.deviationDegree + clover.degree) / 360, false);
                            canvasContext.closePath();
                            canvasContext.stroke();
                            // canvasContext.fill();
                        });
                    } else {
                        console.log('加载宏站信息失败');
                    }
                }).catch(function(error){
                    console.log(error);
                })
            }
        }
    }
}
</script>

<style>
.map-wrapper {
    position: relative;
    width: 100%;
    height: 600px;
    border: 1px solid gray;
}




</style>

