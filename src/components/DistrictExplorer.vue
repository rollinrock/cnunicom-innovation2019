<template>
    <div id="explorer-container" class="explorer-container">
        <!-- <div id="tip-marker" class="tip-marker">{{region}}</div> -->
        <div id="explorer" class="explorer"></div>
    </div>
</template>

<script>

import { lazyAMapApiLoaderInstance } from 'vue-amap';

export default {
    name: 'district-explorer',
    props: {
        height: Number,
    },
    data(){
        return {
            amap: null,
            districtExplorer: null,
            defaultAdcode: 330000, //行政区划-浙江省
            // tipMarker: null,
            region: '浙江省'
        }
    },
    created(){
        let self = this;
        lazyAMapApiLoaderInstance.load().then(() => {
            // your code ...
            self.amap = new AMap.Map('explorer', { 
                zoomEnable: true,
                zoom: 7,
                center: [120.027577,29.302794], //东阳,
                
            });

            AMapUI.loadUI(['geo/DistrictExplorer'], function(DistrictExplorer) {
                //启动页面
                self.initExplorer(DistrictExplorer);
                self.renderAreaNodeByAdcode(self.defaultAdcode);
                
            });

            // self.tipMarker = new AMap.Marker({
            //     content: 'tip-marker',
            //     offset: new AMap.Pixel(0,0),
            //     bubble: true,
            //     map: self.amap
            // });
            
        });
    },
    methods: {
        initExplorer(DistrictExplorer){
            let explorer = this.districtExplorer = new DistrictExplorer({
                map: this.amap,
                eventSupport: true, //打开事件支持
            });

            //事件监听: 鼠标悬浮
            explorer.on('featureMouseover featureMouseout', this.asFeatureMouseOverOrOut);
            explorer.on('outsideClick featureClick', this.asFeatureClick);
            explorer.on('featureMousemove', this.asFeatureMousemove);
            
        },
        
        renderAreaNodeByAdcode(adcode){
            let explorer = this.districtExplorer;
            explorer.loadAreaNode(adcode, (error, areaNode) => {
                if (error) {
                    console.log(error);
                    return;
                }
                explorer.setAreaNodesForLocating(areaNode); //设置用于位置归属识别的areaNode列表，优先级从高到低
                explorer.clearFeaturePolygons();
                var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00",
                    "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707",
                    "#651067", "#329262", "#5574a6", "#3b3eac"];

                //绘制子级区划
                explorer.renderSubFeatures(areaNode, function(feature, i) {

                    var fillColor = colors[i % colors.length];
                    var strokeColor = colors[colors.length - 1 - i % colors.length];

                    return {
                        cursor: 'default',
                        bubble: true,
                        strokeColor: strokeColor, //线颜色
                        strokeOpacity: 1, //线透明度
                        strokeWeight: 1, //线宽
                        fillColor: fillColor, //填充色
                        fillOpacity: 0.3, //填充透明度
                    };
                });

                //绘制父级区划，仅用黑色描边
                explorer.renderParentFeature(areaNode, {
                    cursor: 'default',
                    bubble: true,
                    strokeColor: 'black', //线颜色
                    fillColor: null,
                    strokeWeight: 1, //线宽
                });

                //更新地图视野以适合区划面
                this.amap.setFitView(explorer.getAllFeaturePolygons());
            });
            
        },

        asFeatureMouseOverOrOut(event, feature) {
            let properties = feature.properties;
            this.districtExplorer.findFeaturePolygonsByAdcode(properties.adcode).forEach((poly, index) => {
                poly.setOptions({
                    fillOpacity: (event.type == 'featureMouseover') ? 0.5: 0.3
                });
            });
            this.region = properties.adcode + ':' + properties.name;
            // this.tipMarker.setPosition = 
        },
        asFeatureClick(event, feature) {
            if (feature) {
                let properties = feature.properties;
                if (properties.childrenNum > 0) {
                    this.renderAreaNodeByAdcode(properties.adcode);
                }
            } else { //区域外点击 feature为空
                this.districtExplorer.locatePosition(event.originalEvent.lnglat, (error, routeFeatures) => {
                    this.renderAreaNodeByAdcode(this.defaultAdcode);
                }, {
                    levelLimit: 2 //只取到省级
                });
            }

        },
        asFeatureMousemove(event, feature) {
            // this.tipMarker.setPosition = event.originalEvent.lnglat; 
        }
        
        
    }

}
</script>

<style scoped>
.explorer {  
    border: 1px solid gray;  
    height: 500px;
}


</style>

