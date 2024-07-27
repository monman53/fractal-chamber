import { parameter, parameterProps } from './main'

export const humanReadable = (x: number) => {
  return x.toPrecision(4)
}

export const resetParameter = () => {
  for (const param in parameterProps.value) {
    if (param in parameter.value) {
      parameter.value[param as keyof typeof parameter.value] =
        parameterProps.value[param as keyof typeof parameterProps.value].default
    }
  }
}

export const randomParameter = () => {
  for (const param in parameterProps.value) {
    if (param in parameter.value) {
      const props = parameterProps.value[param as keyof typeof parameterProps.value]
      parameter.value[param as keyof typeof parameter.value] =
        props.min + Math.random() * (props.max - props.min)
    }
  }
}
