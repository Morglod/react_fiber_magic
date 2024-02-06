[![NPM Version](https://badge.fury.io/js/react_fiber_magic.svg?style=flat)](https://www.npmjs.com/package/react_fiber_magic)
[![Size](https://img.shields.io/bundlephobia/minzip/react_fiber_magic)](https://gitHub.com/Morglod/react_fiber_magic/)
[![codecov.io Code Coverage](https://img.shields.io/codecov/c/github/Morglod/react_fiber_magic.svg)](https://codecov.io/github/Morglod/react_fiber_magic?branch=master)
[![GitHub stars](https://img.shields.io/github/stars/Morglod/react_fiber_magic.svg?style=social&label=Star)](https://gitHub.com/Morglod/react_fiber_magic/)

# react_fiber_magic

Swap two components forever on already rendered React app with one line of code.  
At any depth

Update state on any component

Works on 17 & 18 react

_Highly recommended to use in production, when people cant just add extension points inside their components_

![important](./important.jpg)

_In the React world where components play,_  
_Extension points light up the coding day._  
_Flexibility blooms, a developer's delight,_  
_Customizing components, unlocking their might._

```jsx
function Boo() {
    const [c, setC] = React.useState(10);

    return (
        <div>
            {c}
            <button onClick={() => setC((x) => x + 1)}>Click me</button>
        </div>
    );
}

function Boo2() {
    const [c, setC] = React.useState(0);

    return (
        <div>
            {c} hacked!
            <button onClick={() => setC((x) => x + 1)}>Click me</button>
        </div>
    );
}

function Depth() {
    return <Boo />; // <----------- we have Boo here,
}                   //
                    //              than will be replaced with Boo2 here -|
                    //                                                    |
                    //                                                    |
function App() {    //                                                    |
    const r = useHackReplace((type) => type === Boo, Boo2);    // <-------|

    return (
        <div ref={r}>
            <Depth />
        </div>
    );
}
```

## Replace component

**I will always add extension points to my components:**

More examples: [press me](https://github.com/Morglod/react_fiber_magic/src/examples)

```
npm i react_fiber_magic
```

Replace hook:

```ts
import { useHackReplace } from "react_fiber_magic";

// returns ref object
useHackReplace(
    // used to find exact element you are interested in
    (elementType: Component | string, props: {}) => boolean,

    // new component to replace with
    ComponentFunction,

    // useHackReplace creates & returns ref,
    // but if you already have one, you can pass it
    ?RefObject
);

// or with utility func
// they are the same, but hook works with ref
hackReplace(rootElement: Element, predicate, newComponent);
```

## Hack state

```ts
import { getFiberNode, findFiberNode, hackState } from "react_fiber_magic";

const r = useRef(undefined!);

useLayoutEffect(() => {
    // find root fiber
    const rootFiber = getFiberNode(r.current);

    // find Boo inside
    const booFiber = findFiberNode(rootFiber, type => type === Boo);

    // hack it
    const states = hackState(booFiber);
    if (states) {
        states[0].dispatch?.(prev => prev + 200);
    }
}, []);

return <div ref={r}> ... Boo is somewhere inside here ... </div>;
```