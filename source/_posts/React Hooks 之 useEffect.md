---
index_img: /img/2022-04-07-1.png
abbrlink: '0'
date: 2022-04-07 22:04:17
title: React Hooks 之 useEffect
tags: useEffect
categories: React Hook
---

Function Component 是更彻底的状态驱动抽象。要彻底理解 Hooks 需要忘掉 Class Component 生命周期,理解 FC 的思维方式。

## 每次渲染都有他自己的 props 和 state

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

` <p>You clicked {count} times</p>` 该行中的 count 如何理解？

第一感觉是 count 是会“监听”状态变化自动更新。它不是 data binding、watcher、proxy。

```jsx
const count = 42; // count 只是一个数字
// ...
<p>You clicked {count} times</p>
// ...
```

组件第一次渲染，count 初始值是 0。 调用 setCount(1),react 再次渲染组件，这次 count 是 1。以此类推。。。

```jsx
// During first render
function Counter() {
  const count = 0; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// After a click, our function is called again
function Counter() {
  const count = 1; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// After another click, our function is called again
function Counter() {
  const count = 2; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}
```

每次状态更新，react 重新渲染组件。每一次的渲染中的 count 都是独立的值，这个状态值是函数中的一个常量。

任意一次渲染中的count常量都不会随着时间改变。渲染输出会变是因为我们的组件被一次次调用，而每一次调用引起的渲染中，它包含的count值独立于其他渲染。

## 每次渲染都有它自己的事件处理函数

```jsx
const App = () => {
  const [temp, setTemp] = React.useState(5);

  const log = () => {
    setTimeout(() => {
      console.log("3 秒前 temp = 5，现在 temp =", temp);
    }, 3000);
  };

  return (
    <div
      onClick={() => {
        log();
        setTemp(3);
        // 3 秒前 temp = 5，现在 temp = 5
      }}
    >
      xyz
    </div>
  );
};
```

上述代码输出 5，而不是 3

log 函数执行的那个 render 过程， temp 可以看作常量 5。执行 setTemp(3) 后会由一个全新的 render 渲染。所以不会执行 log 函数。而 3 秒后执行的内容是由 temp 为 5 的那个 render 发出的。所以结果为 5。

## 每次 Render 都有自己的 Effects

useEffect 在 DOM 渲染完毕后执行， 也一样拿到的是某次渲染时的值。

每次 render 过程，拿到的 count 都是固化的常量。

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

## 单次渲染内，props 和 state 始终保持不变

所以，每一个组件内的函数（包括事件处理函数，effects，定时器或者API调用等等）会捕获某次渲染中定义的props 和 state。

下面两个例子是相等的：

```jsx
function Example(props) {
  useEffect(() => {
    setTimeout(() => {
      console.log(props.counter);
    }, 1000);
  });
  // ...
}
```

```jsx
function Example(props) {
  const counter = props.counter;
  useEffect(() => {
    setTimeout(() => {
      console.log(counter);
    }, 1000);
  });
  // ...
}
```

在组件内，什么时候读 props 和 state 都一样。在单次渲染内，他们始终保持不变。

## 如何拿最新的值，而不是捕获的值

useRef 可以绕过 Capture Value 的特性。可以认为 ref 在所有 Render 过程中保持着唯一引用，因此所有对 ref 的赋值或取值，拿到的都只有一个最终状态，而不会在每个 Render 间存在隔离。

```jsx
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
    // Set the mutable latest value
    latestCount.current = count;
    setTimeout(() => {
      // Read the mutable latest value
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
  });
  // ...
```

也可以认为，ref 是 Mutable 的，而 state 是 Immutable 的。

## useEffect 回收机制

```jsx
useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
```

假设第一次渲染的时候props是{id: 10}，第二次渲染的时候是{id: 20}。你可能认为顺序如下：

- React 清除了 {id: 10}的effect。
- React 渲染{id: 20}的UI。
- React 运行{id: 20}的effect。

实际上并不是这样，react 只会在浏览器绘制之后运行 useEffect。上一次的 effect 会在重新渲染后被清楚。

- React 渲染{id: 20}的UI。
- 浏览器绘制。我们在屏幕上看到{id: 20}的UI。
- React 清除{id: 10}的effect。
- React 运行{id: 20}的effect。

那为什么清楚上一次的 effect 发生在 props 变为 {id: 20} 之后，却还能看到旧的 {id: 10} ？

effect的清除并不会读取“最新”的props。它只能读取到定义它的那次渲染中的props值。由于 Capture Value 特性，每次 “注册” “回收” 拿到的都是成对的固定值。

确切的说清除上一次的副作用发生在“每次重新渲染之后，副作用函数重新运行执行”。

## 同步，而非生命周期

React会根据我们当前的props和state同步到DOM。“mount”和“update”之于渲染并没有什么区别。

用相同的方式去思考effects。useEffect使你能够根据props和state同步React tree之外的东西。

## 告诉 React 如何对比 Effect

react 在 DOM渲染时会 diff 内容，只对改变的部分做修改。但是对于 effect 却做不到这样。

如何避免 effect 重复调用，需要给 effect 提供一个 deps，deps 内变量改变的时候才执行。

```jsx
useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // Our deps
```

## 依赖项不要撒谎

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // Is this okay? Not always -- and there's a better way to write it.

  // ...
}
```

你设置了依赖项，effect中用到的所有组件内的值都要包含在依赖中。这包括 props，state，函数。

这样做可能会遇到一些问题，比如会遇到重复渲染、无限请求等。解决问题的办法不是移除依赖性。后续再说。

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

setInterval 只想只想一次，依赖写为 []。

但是，因为 useEffect 拿到的是那次渲染时候的值。count 值永远是 0。setCount 没产生作用。

## 对依赖诚实的代价

对依赖诚实，那就把 count 加到依赖中：

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

此时能够拿到最新的 count，但是有问题：

- 每次变化都生成、销毁定时器，性能不好。
- 每次重新定时，不准。

## 让 useEffect 自给自足

上述代码 对只想执行一次的 useEffect 里依赖了外部变量。

解决办法就是 不依赖外部变量。

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
```

setCount 回调写法，对旧值进行修改。此时 useEffect 只允许一次，count 也能拿到最新的值。

## 解耦来自 Actions 的更新

setCount(c => c + 1) 并不能解决所有场景问题。如果我们有两个互相依赖的状态，或者我们想基于一个prop来计算下一次的state，它并不能做到。幸运的是， setCount(c => c + 1)有一个更强大的姐妹模式，它的名字叫useReducer。

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

上述例子中没有依赖撒谎。但是 step 改变时，不想重启定时器怎么办？

当你想更新一个状态，并且这个状态更新依赖于另一个状态的值时，你可能需要用useReducer去替换它们。

利用 useReducer 函数，将更新与动作解耦：

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: "tick" }); // Instead of setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

React会保证 dispatc 在组件的声明周期内保持不变。

## 依赖 props 计算状态

前面介绍了如何移除effect的依赖，不管状态更新是依赖上一个状态还是依赖另一个状态。

但假如我们需要依赖props去计算下一个状态呢。

`<Counter step={1} /> `，此时如何避免依赖 props.step 呢？

把 reducer 函数放到组件内部去读取 props：

```jsx
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);

  function reducer(state, action) {
    if (action.type === 'tick') {
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <h1>{count}</h1>;
}
```

此时 react 仍能保证 dispatch 在每次渲染中都是一样的。

这可以帮助我移除不必需的依赖，避免不必要的effect调用。

## 把函数移到 Effects 里

如果某些函数仅在effect中调用，你可以把它们的定义移到effect中：

```jsx
function SearchResults() {
  const [query, setQuery] = useState('react');

  useEffect(() => {
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=' + query;
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, [query]); // ✅ Deps are OK

  // ...
}

```

## 当函数不能放在 Effects 里

有时函数不能放在 effects 里，如：

- 组件内几个函数使用了相同的函数
- 这个函数是一个 prop

此时能忽略对函数的依赖么？最好不要，effects 对依赖不要撒谎。

两种情况：

- 1、函数内没有使用组件内的任何值，就提到组件外。

```jsx
/ ✅ Not affected by the data flow
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}

function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, []); // ✅ Deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, []); // ✅ Deps are OK

  // ...
}
```

- 2、放组件内，用 useCallback 包装, 将函数添加到依赖

```jsx
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ Preserves identity until query changes
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl();
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

使用 useCallback，因为如果query 保持不变，getFetchUrl也会保持不变，我们的effect也不会重新运行。

父组件传入函数的情况，也适用该方法：

```jsx
function Parent() {
  const [query, setQuery] = useState('react');

  // ✅ Preserves identity until query changes
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
    // ... Fetch data and return it ...
  }, [query]);  // ✅ Callback deps are OK

  return <Child fetchData={fetchData} />
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ Effect deps are OK

  // ...
}
```

避免到处使用 useCallback。

当我们需要将函数传递下去并且函数会在子组件的effect中被调用的时候，useCallback 是很好的技巧且非常有用。或者你想试图减少对子组件的记忆负担，也不妨一试。

- 3、更好的方式可能是把他抽成自定义 Hook，把 fetchData 放在 effect 里。

useEffect 只是底层 API，未来业务接触到的是更多封装后的上层 API，比如 useFetch 或者 useTheme，它们会更好用。

```jsx
import React, { useState, useEffect, useReducer } from 'react'

const GITHUB_API = 'https://api.github.com/repos/chanshiyucx/blog/issues?page=10&per_page='

export default () => {
  const [list, setList] = useState([])
  const [page, setPage] = useState(1)

  const { data, doFetch } = useDataApi(`${GITHUB_API}${page}`, [])
  // 翻页时重新获取列表
  useEffect(() => doFetch(`${GITHUB_API}${page}`), [page])
  useEffect(() => setList(data), [data])

  const handleNextPage = () => setPage(page + 1)

  return (
    <div>
      <button onClick={handleNextPage}>NextPage</button>
      <ul>
        {list.map(o => (
          <li key={o.id}>{o.title}</li>
        ))}
      </ul>

      {isError && <div>Something went wrong ...</div>}
      {isLoading && <div>Loading ...</div>}
    </div>
  )
}
```

reducer: 

```jsx
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      }
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      }
    default:
      throw new Error()
  }
}
```

自定义 Hook：

```jsx
const useDataApi = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl)

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  })

  useEffect(() => {
    let didCancel = false

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' })
      try {
        const response = await fetch(url)
        const data = await response.json()
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: data })
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' })
        }
      }
    }
    fetchData()

    return () => {
      didCancel = true
    }
  }, [url])

  const doFetch = url => {
    setUrl(url)
  }

  return { ...state, doFetch }
}
```
## 参考资料

- [a-complete-guide-to-useeffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- [https://www.robinwieruch.de/react-hooks-fetch-data/](https://www.robinwieruch.de/react-hooks-fetch-data/)