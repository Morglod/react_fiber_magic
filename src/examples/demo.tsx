import React, { useRef } from "react";
import ReactDOM from "react-dom/client";

import { hackReplace } from "..";

function Boo() {
    const [c, setC] = React.useState(0);

    return (
        <span>
            {c}
            <button onClick={() => setC((x) => x + 1)}>Click me</button>
        </span>
    );
}

function Boo2() {
    const [c, setC] = React.useState(0);

    return (
        <span>
            <span className="hacked_button">{c} hacked!</span>
            <button onClick={() => setC((x) => x + 1)}>Click me</button>
            <style dangerouslySetInnerHTML={{
                __html: `
                body {
                    animation: hacked_gooo 90s cubic-bezier(0.6, 0.01, 1, 1);
                }
            `}} />
        </span>
    );
}


function Depth() {
    return <Boo />;
}

function App() {
    const [, forceUpd] = React.useState(0);

    const r = useRef(undefined!);

    return (
        <div ref={r}>
            <button
                className="hacked_button"
                onClick={() => {
                    hackReplace(r.current, (type) => type === Boo, () => Boo2);
                    forceUpd(x => x + 1);
                }}
            >
                Do magic
            </button>
            <Depth />
            <br />
            {codeExample}
        </div>
    );
}

const rootElement = document.getElementById("demo")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

const codeExample =
    <pre dangerouslySetInnerHTML={{
        __html: `hackReplace(ref, (type) => type === Boo, Boo2);`
    }} />;