import { getDeepValue } from "../../../utils"

export const getTitle = (row) => {
  const intentAction = getDeepValue(row, "intentAction");
  switch(true) {
    case intentAction === "D":
      return "Deleted Record";
    case intentAction === "U":
      return "Updated Record";
    case intentAction === "N":
      return "New Record";
    case intentAction === "O":
      return "Original Record";
    default: return "";
  }
}

export const isAutoHeightTableCell = (column) => {
  const columnActionConfig = column.actionConfig;
  return columnActionConfig?.type === "radio" ||
    columnActionConfig?.type === "radio-group" ||
    columnActionConfig?.type === "checkbox" ||
    columnActionConfig?.type === "checkbox-group";
};
