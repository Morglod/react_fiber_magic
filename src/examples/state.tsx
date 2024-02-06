import React, { useLayoutEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

import { findFiberNode, getFiberNode, hackState } from "..";

function Boo() {
    const [c, setC] = React.useState(0);

    return (
        <span>
            {c}
            <button onClick={() => setC((x) => x + 1)}>Click me</button>
        </span>
    );
}

function Depth() {
    return <Boo />;
}

function App() {
    const r = useRef(undefined!);

    useLayoutEffect(() => {
        // find root fiber
        const rootFiber = getFiberNode(r.current);

        // find boo inside
        const booFiber = findFiberNode(rootFiber, type => type === Boo);

        // hack it
        const states = hackState(booFiber);
        if (states) {
            states[0].dispatch?.(200);
        }
    }, []);

    return (
        <div ref={r}>
            <Depth />
            <br />
            {codeExample}
        </div>
    );
}

const rootElement = document.getElementById("state")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

const codeExample =
    <pre dangerouslySetInnerHTML={{
        __html:
            `states = hackState(
    findFiberNode(
        getFiberNode(ref), (type) => type === Boo, Boo2)
    )
);
states[0].dispatch?.(200);`
    }} />;