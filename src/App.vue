<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <el-row>
          <!-- <el-col span=1><img class="brand-logo" src="./assets/bb.jpeg" height="30" width="30" ></el-col> -->
          <el-col class="brand" :span="8">
            <img class="brand-logo" src="./assets/cnunicom-logo.jpeg" height="40" width="40" >
            <h3 class="brand-title">中国联通创新2019-金华分公司</h3>
          </el-col>
          <el-col :span="16">
            <el-menu class="header-operations" mode="horizontal">
              <el-menu-item index="1">登录</el-menu-item>
              <el-menu-item index="2">登出</el-menu-item>

            </el-menu>
          </el-col>
        </el-row>
      </el-header>
      <el-container class="content-wrapper">
        <el-aside>
          <el-menu default-active="1">
            <el-menu-item index="1" @click="showHome=true"><i class="el-icon-s-home"></i>首页</el-menu-item>
            <el-menu-item index="2" @click="showHome=false"><i class="el-icon-location"></i>宏站选址</el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="content">
          <map-locater v-if="showHome===false"></map-locater>
          <p v-if="showHome===true">首页内容</p>
        </el-main>
      </el-container>
      <!-- <el-footer><p>copyright</p></el-footer> -->
    </el-container>
  </div>
</template>

<script>
import MapLocater from './components/MapLocater.vue'

export default {
  name: 'app',
  components: {
    MapLocater
  },
  data() {
    return {
      showHome: true
    }
  },
  methods: {
    showInfo() {
        this.$alert('这是一段内容', '标题名称', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
      }
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

.header {
  line-height: 60px;
}
.brand img{
  float: left;
}
.brand h3 {
  float: left;
}

.brand-logo {
  padding-top: 12px;
  /* padding-bottom: 10px; */
}

.header-operations {
  float: right;
}

.content-wrapper {
  height: 800px;
}

.content {
  /* background-color: #f2f2f2; */
  width: 100%;
  height: 800px;
  /* padding: 20px; */
}





</style>
