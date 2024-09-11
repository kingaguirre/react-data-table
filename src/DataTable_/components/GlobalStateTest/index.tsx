import * as React from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardHeader from "@material-ui/core/CardHeader";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Switch from "@material-ui/core/Switch";
import { useAppStyles, useCardStyles } from "./styles";
import { useFlasher, AppDescription } from "./utils";
import { GlobalStateProvider, IComponent, withState } from '../GlobalStateProvider';

const initialGlobalState = {
  num: 0,
  text: "foo",
  bool: false
};

export const NumComponent = withState({
  states: ['num'],
})(React.memo((props: IComponent) => {
  const { num, setGlobalStateByKey, setGlobalStateByObj } = props;

  const classes = useCardStyles();
  return (
    <Card className={classes.root} ref={useFlasher()}>
      <CardHeader title={`num: ${num}`} />
      <CardActions className={classes.action}>
        <Button
          onClick={() => setGlobalStateByObj({'num': num + 1})}
          // onClick={() => setState?.(num + 1, 'num')}
          variant="outlined"
        >
          Increase
        </Button>
        <Button
          onClick={() => setGlobalStateByKey('num', num - 1)}
          // onClick={() => setGlobalState((prev) => ({...prev, num: prev.num - 1}))}
          variant="outlined"
        >
          Decrease
        </Button>
      </CardActions>
    </Card>
  );
}));


export const TextComponent = withState({
  states: ['text', 'setTestState', 'testFunction'],
})(React.memo((props: IComponent) => {
  const { text, setGlobalState, setTestState, testFunction } = props;

  const classes = useCardStyles();
  return (
    <Card className={classes.root} ref={useFlasher()}>
      <CardHeader title={`text: ${text}`} />
      <button onClick={() => setTestState(prev => prev + 1)}>test</button>
      <CardActions className={classes.action}>
        <TextField
          onChange={(event) => setGlobalState((prev) => ({...prev, text: event.target.value}))}
          // onChange={event => setState?.(event.target.value, 'text')}
          value={text}
        />
      </CardActions>
    </Card>
  );
}));

const BoolComponent = withState({
  states: ['bool', 'someProps', 'setTestState'],
})(React.memo((props: IComponent) => {
  const { bool, setGlobalState, someProps, setTestState } = props;

  const classes = useCardStyles();
  return (
    <Card className={classes.root} ref={useFlasher()}>
      <CardHeader title={`bool: ${bool}`} />
      {someProps}
      <button onClick={() => setTestState(prev => prev + 1)}>test</button>
      <CardActions className={classes.action}>
        <Switch
          onChange={(event) => setGlobalState((prev) => ({...prev, bool: event.target.checked}))}
          // onChange={event => setState?.(event.target.checked, 'bool')}
          checked={bool}
        />
      </CardActions>
    </Card>
  );
}));

export const App = () => {
  const classes = useAppStyles();
  const [testState, setTestState] = React.useState(11);
  const [globalState, setGlobalState] = React.useState({
    num: 0,
    text: "foo",
    bool: false,
  })

  const testFunction = React.useCallback(async (params) => {
    console.log(123);
  }, []);

  return (
    <GlobalStateProvider values={{
      someProps: testState,
      setTestState,
      globalState,
      setGlobalState,
      testFunction
    }}>
      <AppDescription />
      <button onClick={() => setGlobalState((prev) => ({...prev, num: prev.num + 1}))}>Update</button>
      <button onClick={() => setTestState((prev) => prev + 1)}>test props update</button>
      <div className={classes.appContainer}>
        <NumComponent/>
        <TextComponent/>
        <BoolComponent/>
      </div>
    </GlobalStateProvider>
  );
};
