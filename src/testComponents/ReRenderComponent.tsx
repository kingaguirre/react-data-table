import React from "react";

/**
 * Flasher hook.
 */
export const useFlasher = () => {
  const ref: any = React.useRef();
  React.useEffect(() => {
    ref.current.setAttribute(
      "style",
      `box-shadow: 0 0 8px 1px rgb(232, 62, 140);
       background-color: rgb(232, 62, 140, 0.3);
       transition: box-shadow 50ms ease-out;`
    );
    setTimeout(() => ref.current.setAttribute("style", ""), 100);
  });
  return ref;
};

/**
 * Get deep value from object using dot notation
 */
const getDeepValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

/**
 * Shallow comparison of objects excluding function props
 */
const shallowEqualExcludingFunctions = (obj1: any, obj2: any) => {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1).filter(key => typeof obj1[key] !== 'function');
  const keys2 = Object.keys(obj2).filter(key => typeof obj2[key] !== 'function');

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
};

/**
 * Wrapper component to handle selective re-renders based on deep path or name and value props.
 */
interface WrapperProps {
  name: string;
  path?: string; // Path is optional and will be checked first if provided
  value: Record<string, any>;
  children: React.ReactNode;
  [key: string]: any; // For other props
}

const Wrapper = React.memo(
  ({ name, path, value, children, ...rest }: WrapperProps) => {
    // Use path if defined, otherwise fallback to name
    const valuePath = path ? `${path}.${name}` : name;

    // Get the deep value using the `getDeepValue` function
    const deepValue = getDeepValue(value, valuePath);

    // Separate function props from non-function props
    const functionProps = Object.keys(rest).reduce((acc, key) => {
      if (typeof rest[key] === 'function') {
        acc[key] = rest[key];
      }
      return acc;
    }, {} as Record<string, any>);

    const nonFunctionProps = Object.keys(rest).reduce((acc, key) => {
      if (typeof rest[key] !== 'function') {
        acc[key] = rest[key];
      }
      return acc;
    }, {} as Record<string, any>);

    // Only pass non-function props by default to avoid re-renders from function prop changes
    const childProps = { value: deepValue?.value || deepValue, ...nonFunctionProps };

    // Clone the element and pass function props separately if needed
    return React.cloneElement(children as React.ReactElement, {
      ...childProps,
      ...functionProps, // Include functions separately to control re-rendering
    });
  },
  (prevProps, nextProps) => {
    // Determine the path to use (either the provided path + name or just the name)
    const prevPath = prevProps.path ? `${prevProps.path}.${prevProps.name}` : prevProps.name;
    const nextPath = nextProps.path ? `${nextProps.path}.${nextProps.name}` : nextProps.name;

    // Get the previous and next deep values based on the determined path
    const prevValue = getDeepValue(prevProps.value, prevPath);
    const nextValue = getDeepValue(nextProps.value, nextPath);

    // Check if the deep value has changed
    if (prevValue !== nextValue) return false;

    // Shallow compare the rest of the props, ignoring function props
    return shallowEqualExcludingFunctions(prevProps, nextProps);
  }
);

/**
 * Child component, which receives all props from Wrapper.
 */
const ChildComponent: React.FC<{ value?: string | number }> = React.memo((props) => {
  const { value, ...rest } = props;
  console.log("ChildComponent re-rendered with props:", rest);
  return <div ref={useFlasher()}>{typeof value === 'object' ? JSON.stringify(value) : value}</div>;
});

/**
 * Parent component.
 */
export const ParentComponent = () => {
  const [obj, setObj] = React.useState({
    item1: {
      item11: {
        item111: {
          value: "test1"
        }
      }
    },
    item2: "test2"
  });
  const [otherProp1, setOtherProp1] = React.useState("123");

  // Use useCallback to memoize event handlers to avoid unnecessary re-renders
  const updateItem1 = React.useCallback(() => {
    setObj((prev) => ({ ...prev, item1: { item11: { item111: {value: "test3" } } } }));
  }, []);

  const updateItem1OtherProps = React.useCallback(() => {
    setOtherProp1("22323");
  }, []);

  const updateItem2 = React.useCallback(() => {
    setObj((prev) => ({ ...prev, item2: "newTest2" }));
  }, []);

  const reset = React.useCallback(() => {
    setObj({
      item1: {
        item11: {
          item111: {
            value: "test1"
          }
        }
      },
      item2: "test2"
    });
  }, []);

  return (
    <div>
      <Wrapper
        path="item1.item11"
        name="item111"
        onChange={React.useCallback(() => console.log(123), [])}
        value={obj}
        otherProp1={otherProp1}
        otherProp2="456"
      >
        <ChildComponent />
      </Wrapper>
      <Wrapper
        name="item2"
        onChange={React.useCallback(() => console.log(123), [])}
        value={obj}
        otherProp1="789"
        otherProp2="101"
      >
        <ChildComponent />
      </Wrapper>
      <button onClick={updateItem1}>Update Item1</button>
      <button onClick={updateItem1OtherProps}>Update Item1 OtherProps</button>
      <button onClick={updateItem2}>Update Item2</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
