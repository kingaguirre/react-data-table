import styled from 'styled-components';

export const Container = styled.div`
  h2 {
    text-transform: uppercase;
    font-weight: bold;
    margin: 0 0 6px;
    font-size: 24px;
    letter-spacing: 1px;
  }
  code {
    color: #e91e63;
  }
`;

export const ActionsContainer = styled.div`
  padding: 24px 0 12px;
  > p {
    margin: 0 0 6px;
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;
  }
  > div {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    > * {
      display: flex;
      margin: 0 12px;
      > * {
        margin: 6px;
      }
    }
  }
`;

export const BulletContainer = styled.div`
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
`;

export const BulletTitle = styled.h3`
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
  font-size: 20px;
`;

export const BulletList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
`;

export const BulletItem = styled.li`
  margin-bottom: 10px;
  color: #555;
`;

export const BulletSubList = styled.ul`
  list-style-type: circle;
  padding-left: 20px;
`;

export const BulletSubItem = styled.li`
  margin-bottom: 5px;
  color: #777;
`;

export const Highlight = styled.code`
  color: #e91e63; /* Pink highlight */
`;

