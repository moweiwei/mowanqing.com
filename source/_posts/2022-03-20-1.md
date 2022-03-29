---
title: React 中常用 TS 类型
index_img: /img/2022-03-20-1.webp
tags: React TypeScript
categories: React
abbrlink: '25e26362'
date: 2022-03-20 17:21:09
---

## 函数组件注解

```ts
const Test = React.FC<Props>
```

## 类组件注解

```ts
class Test extends React.Component<Props,States>
```

## 泛型 class 组件

```ts
interface SelectProps<T> {
  items: T[]
}

class Select<T> extends React.Component<SelectProps<T>, {}> {
  // ...
}

const Form = () => <Select<string> items={['a', 'b']} />
```