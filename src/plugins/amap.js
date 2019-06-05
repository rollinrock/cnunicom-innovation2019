import Vue from 'vue'
import VueAMap from "vue-amap"

Vue.use(VueAMap)

VueAMap.initAMapApiLoader({
    key: 'dae1306a042d8456178b112d2ec3ea1d',
    plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 
        'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor', 'AMap.CustomLayer', 'Geocoder', 'Geolocation'],
    uiVersion: '1.0.11', // 版本号
    // 默认高德 sdk 版本为 1.4.14
    v: '1.4.14'
  })