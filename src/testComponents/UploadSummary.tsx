import React from 'react';
import styled from 'styled-components';

const BulletContainer = styled.div`
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  font-size: 16px;
`;

const BulletTitle = styled.h3`
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
`;

const BulletList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
`;

const BulletItem = styled.li`
  margin-bottom: 10px;
  color: #555;
`;

const BulletSubList = styled.ul`
  list-style-type: circle;
  padding-left: 20px;
`;

const BulletSubItem = styled.li`
  margin-bottom: 5px;
  color: #777;
`;

const Highlight = styled.code`
  color: #e91e63; /* Pink highlight */
`;


export const UploadSummary = () => {
  return (
    <BulletContainer>
      <BulletTitle>Upload Summary</BulletTitle>
      <BulletList>
        <BulletItem>
          When uploading, if <strong>intentAction</strong> is <Highlight>'U'</Highlight> (Update):
          <BulletSubList>
            <BulletSubItem>
              The function checks if the <Highlight>rowKeys</Highlight> from the <Highlight>uploaded data</Highlight> (e.g., Excel) exist in the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              For each key, it compares the current value in the <Highlight>data-table rows</Highlight> with the new value from the <Highlight>uploaded data</Highlight>.
              <BulletSubList>
                <BulletSubItem>
                  If values differ, the updated key will have the following structure:
                  <pre>{`{
  "previous": { "value": "oldValue" },
  "value": "newValue",
  "isChanged": true
}`}</pre>
                </BulletSubItem>
                <BulletSubItem>If values are the same, no changes are made.</BulletSubItem>
              </BulletSubList>
            </BulletSubItem>
            <BulletSubItem>The row in the <Highlight>data-table rows</Highlight> is updated with the new values.</BulletSubItem>
            <BulletSubItem>
              <strong>Note:</strong> If the <Highlight>intentAction</Highlight> is <Highlight>'U'</Highlight> (Update) and the <Highlight>rowKeys</Highlight> do not exist in the <Highlight>data-table rows</Highlight>, the function does nothing (ignores the row).
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          When uploading, if <strong>intentAction</strong> is <Highlight>'D'</Highlight> (Delete):
          <BulletSubList>
            <BulletSubItem>
              The function checks if the <Highlight>rowKeys</Highlight> exist in the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              If the row exists, it updates only the <Highlight>intentAction</Highlight> to <Highlight>'D'</Highlight>, but does not modify any other data in the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              If the row does not exist, the function ignores the object (does nothing).
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          When uploading, if <strong>intentAction</strong> is <Highlight>'N'</Highlight>, <Highlight>'O'</Highlight>, <Highlight>null</Highlight>, or <Highlight>undefined</Highlight>:
          <BulletSubList>
            <BulletSubItem>
              The function checks if the <Highlight>rowKeys</Highlight> already exist in the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              If the <Highlight>rowKeys</Highlight> don’t exist, it prepends the new row with <Highlight>intentAction</Highlight> set to <Highlight>'N'</Highlight> into the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>If the <Highlight>rowKeys</Highlight> exist, the row is ignored (does nothing).</BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          <strong>New Condition:</strong> If the <Highlight>rowKeys</Highlight> (or first column) do not exist in the <Highlight>data-table rows</Highlight>, for any <Highlight>intentAction</Highlight> (or second column), the function prepends the row to the <Highlight>data-table rows</Highlight> and sets the <Highlight>intentAction</Highlight> to <Highlight>'N'</Highlight>, regardless of the original <Highlight>intentAction</Highlight>.
        </BulletItem>
        <BulletItem>
          <strong>Important:</strong> If the first column is <Highlight>undefined</Highlight> or does not match the <Highlight>rowKeys</Highlight>, or the second column is not the <Highlight>intentAction</Highlight>, the functions will not work as expected and will ignore the row. This means:
          <BulletSubList>
            <BulletSubItem>
              The first column of the uploaded data must be the <Highlight>rowKeys</Highlight>, identifying each unique row.
            </BulletSubItem>
            <BulletSubItem>
              The second column of the uploaded data must be the <Highlight>intentAction</Highlight>, determining the action to take (Update, Delete, etc.).
            </BulletSubItem>
            <BulletSubItem>
              If either of these conditions is not met, the row will be ignored, and no updates or changes will be applied.
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
      </BulletList>
    </BulletContainer>
  );
};

export const DownloadSummary = () => {
  return (
    <BulletContainer>
      <BulletTitle>Download Summary</BulletTitle>
      <BulletList>
        <BulletItem>
          When downloading data:
          <BulletSubList>
            <BulletSubItem>
              The first column in the downloaded file will contain the <Highlight>rowKeys</Highlight>, representing the unique identifier for each row.
            </BulletSubItem>
            <BulletSubItem>
              The second column in the downloaded file will contain the <Highlight>intentAction</Highlight>, indicating the action associated with each row (e.g., Update, Delete).
            </BulletSubItem>
            <BulletSubItem>
              Additional columns will reflect the rest of the data in the <Highlight>data-table rows</Highlight>, depending on the structure of the data.
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
      </BulletList>
    </BulletContainer>
  );
};
