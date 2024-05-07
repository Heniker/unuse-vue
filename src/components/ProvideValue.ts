import * as v from 'vue'

/**
 * Component that resends all props passed to it as writeable v-slot arguments
 * 
 * @example <provide-value :a="42" v-slot="slot"><button v-on:click="slot.a++">{{slot.a}}</button></provide-value>
 */
export const ProvideValue = v.defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const writeableProps = v.reactive(Object.assign({}, attrs))

    return () => v.renderSlot(slots, 'default', v.normalizeProps(writeableProps) || {})
  },
})