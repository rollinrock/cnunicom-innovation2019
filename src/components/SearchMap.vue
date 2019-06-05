<template>
    <div>
        <!-- <div class="input-group input-group-sm mb-3 search-box">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1"><i class="fa fa-search" aria-hidden="true"></i></span>
            </div>
            <input id="pickerInput" type="text" class="form-control" placeholder="请输入关键字" aria-label="location" aria-describedby="basic-addon1">
        </div> -->
        
        <el-form :inline="true" :model="location">
            <el-form-item label="地点">
                <el-input id="pickerInput" v-model="location.name" placeholder="搜索地点"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
            </el-form-item>
        </el-form>
        
        <div id="map-container" class="map-container">
        </div>
    </div>
</template>

<script>
import { lazyAMapApiLoaderInstance } from 'vue-amap'
import axios from'axios'
import '../plugins/element.js'

export default {
    name: 'search-map',
    props: {
        height: Number
    },
    data() {
        return {
            location: {
                name: null
            },
            amap: null,
            circle: null,
            // circleEditor: null,
            initialCircleRadius: 800,
            mapCenter: [119.663884,29.071339],
            cloverMapLayer: null,
            cloverMapLayerCanvas: null,
            canvasContext: null,
            placeSearch: null
        }
    },
    created() {
        let self = this;
        lazyAMapApiLoaderInstance.load().then(() => {
            let amap = self.amap = new AMap.Map('map-container', {
                zoom: 14,
                zooms: [5, 16],
                center: self.mapCenter,
            });



            AMap.plugin(['AMap.Autocomplete','AMap.PlaceSearch','AMap.ToolBar','AMap.Scale','AMap.CustomLayer'], () => {
                //地图插件
                amap.addControl(new AMap.ToolBar({position: 'LT'}));
                amap.addControl(new AMap.Scale({position: 'LB'}));


                let autoOpts = {
                    city: '金华市',
                    cityLimit: true,
                    input: 'pickerInput',
                };
                let autoComplete = new AMap.Autocomplete(autoOpts);

                let searchOpts = {
                    map: self.amap,
                };
                let placeSearch = self.placeSearch = new AMap.PlaceSearch(searchOpts);

                AMap.event.addListener(autoComplete, 'select', evt => {
                    placeSearch.search(evt.poi.name);
                });

                let cloverMapLayerCanvas = self.cloverMapLayerCanvas = document.createElement('canvas');
                cloverMapLayerCanvas.height = amap.getSize().getHeight();
                cloverMapLayerCanvas.width = amap.getSize().getWidth();

                //创建自定义图层
                let cloverMapLayer = self.cloverMapLayer = new AMap.CustomLayer(cloverMapLayerCanvas, {
                    map: self.amap,
                    opacity: 0.5,
                    zindex: 12
                });
                cloverMapLayer.render = self.renderCloverMapLayer;
                cloverMapLayer.render();

                
            });

            // let circle = self.circle = new AMap.Circle({
            //     map: self.amap,
            //     center: self.mapCenter,
            //     radius: self.initialCircleRadius,
            //     borderWeight: 3,
            //     strokeColor: "#FF33FF", 
            //     strokeOpacity: 1,
            //     strokeWeight: 6,
            //     fillOpacity: 0.4,
            //     strokeStyle: 'dashed',
            //     strokeDasharray: [10, 10], 
            //     // 线样式还支持 'dashed'
            //     fillColor: '#1791fc',
            //     zIndex: 50,
            // });

            // circle.hide();

            // let circleEditor = self.circleEditor = new AMap.CircleEditor(self.amap, circle);
            // circleEditor.on('move', asCircleMove);
            // circleEditor.on('adjust', asCircleAdjust);


            
            
        });

        
        

    }, 
    amounted() {
        console.log('begin render layer');
        this.cloverMapLayer.render();//绘制

    },
    methods: {
        handleSearch() {
            if (!this.placeSearch && !this.location.name) {
                this.placeSearch.search(this.location.name)
            }
        },
        drawCircleAtCenter() {
            this.circle.show();
            this.circle.setCenter(this.amap.getCenter());
            this.circleEditor.open();
        },
        // asCircleAdjust(evt) {
        //     console.log(evt);
        // },
        // asCircleMove(evt) {
        //     console.log(evt);
        // },
        doneDrawingCircle() {

        },
        removeCircle() {
            this.circleEditor.close();
            this.circle.hide();
        },
        asPolygonDbclicked(evt) {
            console.log('polygon [' + evt.target.extData.id + '] was dbclicked');
            let info = new AMap.InfoWindow({
                position: evt.lnglat,
                autoMove: true,
                content: '当前扇区['+evt.target.extData.id+']被双击啦'
            });
            info.open(this.amap, evt.lnglat);
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
                
                canvasContext.strokeStyle = 'blue';
                canvasContext.fillStyle = 'red';
                canvasContext.fillOpacity = 1;
                //绘制三叶草图
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
                            // let path = new Array();
                            // clover.polygonPath.forEach(coor => path.push([coor.longitude, coor.latitude]));
                            // let polygon = new AMap.Polygon({
                            //     map: self.amap,
                            //     fillOpacity: 0.8,
                            //     path: path,
                            //     extData: {
                            //         id: clover.id
                            //     }
                            // });
                            // polygon.on('dbclick', self.asPolygonDbclicked);

                            

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

<style scoped>
.search-box {
    position: absolute;
    top: 5px;
    right: 20px;
    z-index: 100;
    width: 150px;
}

.area-selector {
    position: absolute;
    bottom: 5px;
    right: 20px;
    z-index: 100;
    width: 150px;
}

.map-container {
    position: relative;
    width: 100%;
    height: 600px;
    border: 1px solid gray;  
}
</style>


