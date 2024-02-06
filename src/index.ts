import * as React from "react";

type NodeMatcher = (
    factory: any,
    props: any,
    _fiber: any,
    _element: any
) => boolean;

export function findFiberNode(
    fiberNode: any,
    finder: NodeMatcher,
    _r?: any,
    _next?: any
) {
    if (finder(fiberNode.type, fiberNode.memoizedProps, fiberNode, undefined)) {
        return fiberNode;
    }
    if (!fiberNode.child) return null;
    _next = fiberNode.child;
    do {
        _r = findFiberNode(_next, finder);
        if (_r) return _r;
        _next = _next.sibling;
    } while (_next);
    return null;
}

export function getFiberNode(el: Element) {
    return (el as any)[
        Object.keys(el).find((x) => x.startsWith("__reactFiber$"))!
    ];
}

export function getFiberWithState(fiberNode: any) {
    if (fiberNode.stateNode) {
        const stateNode = getFiberNode(fiberNode.stateNode);
        return stateNode?.return;
    }
    return fiberNode;
}

export function hackState(fiberNode: any):
    | {
          value: any;
          dispatch?: (action: React.SetStateAction<any>) => void;
      }[]
    | undefined {
    const stateNode = getFiberWithState(fiberNode);
    if (!stateNode) return [];

    let nextState = stateNode.memoizedState;
    const states = [];
    while (nextState) {
        states.push({
            value: nextState.memoizedState,
            dispatch: nextState.queue?.dispatch,
        });
        nextState = nextState.next;
    }
    return states;
}

export function hackReplace(
    ref: Element,
    finder: NodeMatcher,
    toElementType: any
) {
    const rootFiberNode = getFiberNode(ref);
    const found = findFiberNode(rootFiberNode, finder);
    if (!found) {
        return;
    }
    found.type = toElementType;
    found.elementType = toElementType;

    const replaces = new Map();

    const doReplace = (el: any): any => {
        if (finder(el.type, el.props, undefined, el)) {
            return {
                ...el,
                type: toElementType,
            };
        }
        if (replaces.has(el.type)) {
            return {
                ...el,
                type: replaces.get(el.type),
            };
        }
        if (el.props?.children) {
            return {
                ...el,
                props: {
                    ...el.props,
                    children: React.Children.map(el.props.children, doReplace),
                },
            };
        }
        return el;
    };

    let _next = found.return;
    while (_next && typeof _next.type !== "symbol") {
        if (typeof _next.type === "function") {
            let Hacked;
            if (replaces.has(_next.type)) {
                Hacked = replaces.get(_next.type);
            } else {
                const Orig = _next.type;
                Hacked = (...args: any[]) => doReplace(Orig(...args));
                (Hacked as any).displayName = Orig.displayName || Orig.name;
                replaces.set(_next.type, Hacked);
            }
            _next.type = Hacked;
            _next.elementType = Hacked;
        }

        if (_next.pendingProps?.children) {
            _next.pendingProps = {
                ..._next.pendingProps,
                children: React.Children.map(
                    _next.pendingProps.children,
                    doReplace
                ),
            };
        }
        if (_next.memoizedProps?.children) {
            _next.memoizedProps = {
                ..._next.memoizedProps,
                children: React.Children.map(
                    _next.memoizedProps.children,
                    doReplace
                ),
            };
        }

        if (_next.return === null) {
            if (_next.updateQueue?.baseState?.element?.type) {
                _next.updateQueue.baseState.element = {
                    ..._next.updateQueue.baseState.element,
                    type: _next.type,
                };
            }
            if (_next.memoizedState?.element?.type) {
                _next.memoizedState.element = {
                    ..._next.memoizedState.element,
                    type: _next.type,
                };
            }
        }

        _next = _next.return;
    }
}

export function useHackReplace(
    finder: NodeMatcher,
    toElementType: any,
    ref?: React.RefObject<any>
): React.RefObject<any> {
    const r = arguments.length === 3 ? ref! : React.useRef<any>(undefined!);
    const [, forceUpdate] = React.useState(0);

    React.useEffect(() => {
        hackReplace(r.current, finder, toElementType);
        forceUpdate((x) => x + 1);
    }, []);

    return r;
}
