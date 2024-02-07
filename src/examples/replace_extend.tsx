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

function Boo2(...args: any[]) {
    const ch = (Boo as any)(...args);

    return {
        ...ch,
        props: {
            ...ch.props,
            children: [...ch.props.children, <button key="heh">And me!</button>]
        }
    };
}

function Depth() {
    return <Boo />;
}

function App() {
    const r = useHackReplace((type) => type === Boo, Boo2);

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
