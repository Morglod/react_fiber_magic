import React from "react";
import ReactDOM from "react-dom/client";

import { useHackReplace } from "..";

function Boo() {
    const [c, setC] = React.useState(10);

    return (
        <span>
            {c}
            <button onClick={() => setC((x) => x + 1)}>Click me</button>
        </span>
    );
}

const createBoo2 = (OriginalBoo: any) => (...args: any[]) => {
    const ch = (OriginalBoo as any)(...args);

    return {
        ...ch,
        props: {
            ...ch.props,
            children: [...ch.props.children, <button key="heh">And me!</button>]
        }
    };
};

function Depth() {
    return <Boo />;
}

function App() {
    const r = useHackReplace((type) => type === Boo, createBoo2);

    return (
        <div ref={r}>
            <Depth />
        </div>
    );
}

const rootElement = document.getElementById("replace")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
