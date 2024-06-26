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
  const { num, setState, setNum } = props;

  const classes = useCardStyles();
  return (
    <Card className={classes.root} ref={useFlasher()}>
      <CardHeader title={`num: ${num}`} />
      <CardActions className={classes.action}>
        <Button
          onClick={() => setNum?.(num + 1, 'num')}
          variant="outlined"
        >
          Increase
        </Button>
        <Button
          onClick={() => setNum?.(num - 1, 'num')}
          variant="outlined"
        >
          Decrease
        </Button>
      </CardActions>
    </Card>
  );
}));


export const TextComponent = withState({
  states: ['text'],
})(React.memo((props: IComponent) => {
  const { text, setState } = props;

  const classes = useCardStyles();
  return (
    <Card className={classes.root} ref={useFlasher()}>
      <CardHeader title={`text: ${text}`} />
      <CardActions className={classes.action}>
        <TextField
          onChange={event => setState?.(event.target.value, 'text')}
          value={text}
        />
      </CardActions>
    </Card>
  );
}));

const BoolComponent = withState({
  states: ['bool'],
})(React.memo((props: IComponent) => {
  const { bool, setState } = props;

  const classes = useCardStyles();
  return (
    <Card className={classes.root} ref={useFlasher()}>
      <CardHeader title={`bool: ${bool}`} />
      <CardActions className={classes.action}>
        <Switch
          onChange={event => setState?.(event.target.checked, 'bool')}
          checked={bool}
        />
      </CardActions>
    </Card>
  );
}));

export const App = () => {
  const classes = useAppStyles();
  const [num, setNum] = React.useState(0);

  // React.useEffect(() => {
  //   // Update num to 1 after 2 seconds
  //   const timer = setTimeout(() => {
  //     setNum(1);
  //   }, 2000);

  //   // Clear the timer on unmount to avoid memory leaks
  //   return () => clearTimeout(timer);
  // }, []); // Empty dependency array to run only on mount

  return (
    <GlobalStateProvider globalState={{
      num: num,
      text: "foo",
      bool: false
    }}>
      <AppDescription />
      <button onClick={() => setNum((prev) => prev + 1)}>Update</button>
      <div className={classes.appContainer}>
        <NumComponent setNum={setNum}/>
        <TextComponent/>
        <BoolComponent/>
      </div>
    </GlobalStateProvider>
  );
};
