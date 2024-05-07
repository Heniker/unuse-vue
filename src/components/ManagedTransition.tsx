import * as v from 'vue'

type InferParameters<T> = T extends v.FunctionalComponent<infer U> ? U : never
type TransitionProps = InferParameters<typeof v.Transition>

const normalizeProps = (props: v.ComponentPropsOptions = {}) =>
  Array.isArray(props)
    ? Object.assign({}, ...props.map((it) => ({ [it]: {} })))
    : Object.fromEntries(Object.keys(props).map((it) => [it, {}]))

const propTypes = {
  triggerOn: {} as any,
  ...(normalizeProps(v.Transition.props) as TransitionProps),
}

// Slots typing is broken and I can't fix it. To my knowledge it's not possible to use generics to type slots provided value
// Vue TS support is poor to say the least

/**
 * Transition that triggers on prop update.\
 * Provided slot value will be updated with `triggerOn` prop value after transition finishes.\
 * Components are not recreated after transition. VNodes will be kept, state won't be lost, setups won't trigger.\
 * This allows to force-trigger transition without `:key` hack and avoids useless re-renders.
 *
 * Provided example will trigger transition on any `sampleData` change without re-rendering underlying component.
 * `value` will be equeal to `sampleData` after transition finishes
 *
 * @example
 * ```
 * <ManagedTransition name="fade-in" :triggerOn="sampleData" v-slot="value">
 * 	<div>{{ value }}</div>
 * </ManagedTransition>
 * ```
 */
export const ManagedTransition = v.defineComponent(
  (props: typeof propTypes, ctx) => {
    const instance = v.getCurrentInstance()

    let el: v.VNode['el'] | undefined = undefined
    let transition: v.VNode['transition'] | undefined = undefined

    const delayedTrigger = v.ref(props.triggerOn)

    v.watch(
      () => props.triggerOn,
      () => {
        if (!transition || !el) {
          return
        }

        transition.leave(el, async () => {
          await v.nextTick()

          if (!transition || !el) {
            return
          }

          delayedTrigger.value = props.triggerOn as any
          transition.beforeEnter(el)
          transition.enter(el)
        })
      }
    )

    return () => {
      const DefaultSlot = ctx.slots.default?.(delayedTrigger.value)

      v.nextTick(() => {
        transition = DefaultSlot[0].transition
        el = instance?.vnode.el
      })

      return <v.Transition {...props}>{DefaultSlot}</v.Transition>
    }
  },
  {
    props: propTypes as any,
    slots: {} as v.SlotsType<{ default: (typeof propTypes)['triggerOn'] }>,
  }
)
