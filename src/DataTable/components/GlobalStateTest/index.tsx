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

const NumComponent = withState({
  states: ['num'],
})(React.memo((props: IComponent) => {
  const { num, setState } = props;

  const classes = useCardStyles();
  return (
    <Card className={classes.root} ref={useFlasher()}>
      <CardHeader title={`num: ${num}`} />
      <CardActions className={classes.action}>
        <Button
          onClick={() => setState?.(num + 1, 'num')}
          variant="outlined"
        >
          Increase
        </Button>
        <Button
          onClick={() => setState?.(num - 1, 'num')}
          variant="outlined"
        >
          Decrease
        </Button>
      </CardActions>
    </Card>
  );
}));


const TextComponent = withState({
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

  return (
    <GlobalStateProvider globalState={initialGlobalState}>
      <AppDescription />
      <div className={classes.appContainer}>
        <NumComponent/>
        <TextComponent/>
        <BoolComponent/>
      </div>
    </GlobalStateProvider>
  );
};
