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
 * Shallow comparison of objects
 */
const shallowEqual = (obj1: any, obj2: any) => {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
};

/**
 * Wrapper component to handle selective re-renders based on the name and value props.
 */
interface WrapperProps {
  name: string;
  value: Record<string, any>;
  children: React.ReactNode;
  [key: string]: any; // For other props
}

const Wrapper = React.memo(
  ({ name, value, children, ...rest }: WrapperProps) => {
    // Pass the relevant value and all additional props to the child
    const childProps = { value: value[name], ...rest };

    return React.cloneElement(children as React.ReactElement, childProps);
  },
  (prevProps, nextProps) => {
    const prevValue = prevProps.value[prevProps.name];
    const nextValue = nextProps.value[nextProps.name];

    // Check if value[name] has changed
    if (prevValue !== nextValue) return false;

    // Shallow compare the rest of the props
    return shallowEqual(prevProps, nextProps);
  }
);

/**
 * Child component, which receives all props from Wrapper.
 */
/** This ChildComponent will be the TXInput will be */
const ChildComponent: React.FC<{ value?: string }> = React.memo(({ value, ...rest }) => {
  console.log("ChildComponent re-rendered with props:", rest);
  return <div ref={useFlasher()}>{value}</div>;
});

/**
 * Parent component.
 */
export const ParentComponent = () => {
  const [obj, setObj] = React.useState({ name1: "test1", name2: "test2" });
  const [otherProp1, setOtherProp1] = React.useState("123");

  const updateName1 = () => {
    setObj((prev) => ({ ...prev, name1: "test3" }));
  };
  
  const updateName1OtherProps = () => {
    setOtherProp1("22323");
  };

  const updateName2 = () => {
    setObj((prev) => ({ ...prev, name2: "newTest2" }));
  };

  const reset = () => {
    setObj({ name1: "test1", name2: "test2" });
  };

  return (
    <div>
      <Wrapper name="name1" value={obj} otherProp1={otherProp1} otherProp2="456">
        <ChildComponent />
      </Wrapper>
      <Wrapper name="name2" value={obj} otherProp1="789" otherProp2="101">
        <ChildComponent />
      </Wrapper>
      <button onClick={updateName1}>Update Name1</button>
      <button onClick={updateName1OtherProps}>Update Name1 OtherProps</button>
      <button onClick={updateName2}>Update Name2</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
