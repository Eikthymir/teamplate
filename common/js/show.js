import modal from '@/components/modal/modal.vue'
import Vue from 'vue'

let modalConstructor = Vue.extend(modal)

let instance
let seed = 1
let index = 2000

const install = () => {
	Object.defineProperty(Vue.prototype, '$showModal', {
		get() {
			let id = 'message_' + seed++
			const modalMsg = options => {
				instance = new modalConstructor({
					propsData: options
				})
				index++
				instance
				instance.vm = instance.$mount()
				document.body.appendChild(instance.vm.$el)
				instance.vm.$el.style.zIndex = index
				return instance.vm
			}
			return modalMsg
		}
	})
}

export default install
