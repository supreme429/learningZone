<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h3 @click="showMe">Installed CLI Plugins</h3>
    <button @click="add">+</button>
    <div class="divStyle">{{ countNum }}</div>
    <button @click="minus">-</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;

  private countNum: number = 0;

  showMe(this: any) {
    const that = this;
    console.log(that.msg);
  }

  add(this: any) {
    const that = this;
    that.countNum += 1;
  }

  minus(this: any) {
    const that = this;
    that.countNum -= 1;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.divStyle {
  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 10px;
  background: #333;
  color: #fff;
  margin: 5px auto 5px;
}
</style>
