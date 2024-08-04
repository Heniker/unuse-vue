import * as v from 'vue'
import { extendRef } from '@vueuse/core'

// https://vueuse.org/shared/createEventHook
export const createTrigger = <T>() => {
  const trigger = v.shallowRef<T>()

  // https://www.youtube.com/watch?v=-WpnPSChVRQ
  return extendRef(v.readonly(trigger), { pull: (arg: T) => (trigger.value = arg) })
}
