<template>
	<picker :value="index" :range="names" @change="bindPickerChange">
		<view class="picker">
			<text v-if="isSelected()">{{ names[index] }}</text>
			<text v-else style="color: #999999;">请选择</text>
		</view>
	</picker>
</template>

<script>
	export default {
		props: {
			/**
			 * 回显对象
			 */
			value: {
				type: [Object, String, Number]
			},
			/**
			 * 格式，[{ name: 'xx': id: 'xxx' }]
			 */
			list: {
				type: Array,
				default: () => []
			},
			name: {
				type: String,
				default: 'name'
			},
			id: {
				type: String,
				default: 'id'
			}

		},
		data() {
			return {
				index: 0,
				names: [],
				ids: [],
				checked: ''
			}
		},
		watch: {
			value(v) {
				this.mapVal(v)
			},
			list(v) {
				this.mapList(v)
			},
		},
		mounted() {
			this.mapList(this.list)
			this.mapVal(this.value)
		},
		methods: {
			bindPickerChange({ detail }) {
				const index = +detail.value
				const currVal = this.list[index]
				this.checked = this.ids[index]
        const valProps = this.setVal(this.value)
				if (valProps === this.checked) {
					return
				}
				currVal.index = index
				this.$emit('input', this.checked)
				this.$emit('change', currVal)
			},
			mapVal(v) {
				const val = this.setVal(v)
				this.list.forEach((e, i) => {
          //是否初始化选中
					if (e[this.id] == val) {//=== 改成==才有初始化数据
						this.index = i
						this.checked = this.ids[i]
					}
				})
			},
			mapList(v) {
				this.names = v.map(e => e[this.name])
				this.ids = v.map(e => e[this.id])
			},
			isSelected() {
				if (this.checked === 0 || this.setVal(this.value) === 0) {
					return true
				}
				return this.setVal(this.value) && this.checked
			},
      setVal(v) {
        // console.log('v=',v)
        if (!v && typeof v !== 'number') {
          return ''
        }
        if (typeof v === 'string' || typeof v === 'number') {
          //console.log('ids=',this.ids)
          // this.ids.forEach((item,index)=>{
          //     if(item == v) {
          //         this.checked = index;
          //     }
          // })
          return v
        }
        this.checked = this.id
        return v[this.id]
      }
		}
	}
</script>

<style scoped lang="scss"></style>
