import * as React from "react";

type NodeMatcher = (
    factory: any,
    props: any,
    _fiber: any,
    _reactElement: any
) => boolean;

function isMemoizedComponent(Component: any) {
    return (
        typeof Component === "object" &&
        "$$typeof" in Component &&
        Component["$$typeof"]?.description === "react.memo"
    );
}

export function useWrapHackReplace(
    BaseComponent: any,
    finder: NodeMatcher,
    getToElementType: (foundType: any) => any,
    deps: any[] = []
) {
    const [NewCard, setNewCard] = React.useState<any>();

    React.useEffect(() => {
        const nn = wrapHackReplace(BaseComponent, finder, getToElementType);
        setNewCard(() => nn);
    }, deps);

    return NewCard;
}

export function wrapHackReplace(
    BaseComponent: any,
    finder: NodeMatcher,
    getToElementType: (foundType: any) => any
) {
    if (!BaseComponent) return BaseComponent;

    let wrapBack = (x: any) => x;

    if (isMemoizedComponent(BaseComponent)) {
        const inner = BaseComponent.type;
        wrapBack = (x: any) => React.memo(x, BaseComponent.compare);
        BaseComponent = inner;
    }

    const mapChildren = (children: any) => {
        return React.Children.map(children, (child): any => {
            if (!child) return child;

            if (
                "type" in child &&
                finder(child.type, child.props, undefined, child)
            ) {
                return {
                    ...child,
                    type: getToElementType(child.type),
                };
            }

            if ("props" in child && "children" in child.props) {
                return {
                    ...child,
                    props: {
                        ...child.props,
                        children: mapChildren(child.props.children),
                    },
                };
            }
            return child;
        });
    };

    const Comp = (...args: any[]) => {
        const children = BaseComponent(...args);
        return mapChildren(children);
    };

    return wrapBack(Comp);
}

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
